import {
    type ReactNode,
    useMemo,
    useRef,
    useContext,
    useState,
    useEffect,
    createContext
} from "react";
import {
    type PublicComponentProps,
    spatialNavigation,
    FOCUSED_CLASS_NAME,
    ROOT_FOCUS_KEY,
} from "./spatial-navigation";
import { issueUniqueId } from "./unique-id";

type ContextBase = {
    parentFocusKey: string;
    parentFocusKeyTable: Record<string, 1>;
}

const contextObj: ContextBase = {
    parentFocusKey: ROOT_FOCUS_KEY,
    parentFocusKeyTable: {
        [ROOT_FOCUS_KEY]: 1,
    }
};

const Context = createContext(contextObj);

export const useFocusable = <T extends HTMLElement = HTMLDivElement>(args: PublicComponentProps = {}) => {
    const noop = () => { };
    const _onBackPress = () => false as const;
    const {
        className,
        focusKey = null,
        preferredChildFocusKey = null,
        forgetLastFocusedChild = false,
        trackChildren = false,
        blockNavigationOut = false,
        autoRestoreFocus = true,
        autoDelayFocusToChild = false,
        focusable = true,
        onBackPress = _onBackPress,
        onEnterPress = noop,
        onEnterRelease = noop,
        onBecameFocused = noop,
        onBecameBlurred = noop,
        onArrowPress = noop,
    } = args;

    const ref = useRef<T>(null);
    const isFirstRender = useRef(true);
    const realFocusKey = useMemo(() => focusKey || issueUniqueId("sn:focusable-item"), []);
    const { parentFocusKey, parentFocusKeyTable } = useContext(Context);
    const keydownHandlingMethod = useRef({
        onBackPress,
        onEnterPress,
        onEnterRelease,
        onBecameFocused,
        onBecameBlurred,
        onArrowPress,
    });
    const [focused, setFocused] = useState(false);
    const [hasFocusedChild, setHasFocusedChild] = useState(false);

    // 常に最新の props（methods）を参照する
    keydownHandlingMethod.current = {
        onBackPress,
        onEnterPress,
        onEnterRelease,
        onBecameFocused,
        onBecameBlurred,
        onArrowPress,
    };

    const focusableProps = {
        className: focused ? (className ? `${className} ${FOCUSED_CLASS_NAME}` : FOCUSED_CLASS_NAME) : className,
        focusKey: realFocusKey,
        parentFocusKey,
        setFocus: spatialNavigation.setFocus.bind(spatialNavigation, realFocusKey),
        stealFocus: spatialNavigation.setFocus.bind(spatialNavigation, realFocusKey, realFocusKey),
        focused,
        hasFocusedChild,
        navigateByDirection: spatialNavigation.navigateByDirection.bind(spatialNavigation),
        resumeSpatialNavigation: spatialNavigation.resume.bind(spatialNavigation),
        pauseSpatialNavigation: spatialNavigation.pause.bind(spatialNavigation),
        updateAllSpatialLayouts: spatialNavigation.updateAllLayouts.bind(spatialNavigation),
        getCurrentFocusKey: spatialNavigation.getCurrentFocusKey.bind(spatialNavigation),
    } as const;

    useEffect(() => {
        spatialNavigation.addFocusable({
            node: ref.current,
            focusKey: realFocusKey,
            parentFocusKey: parentFocusKey,
            parentFocusKeyTable: parentFocusKeyTable,
            preferredChildFocusKey,
            forgetLastFocusedChild,
            trackChildren,
            blockNavigationOut: blockNavigationOut,
            autoRestoreFocus: autoRestoreFocus,
            autoDelayFocusToChild: autoDelayFocusToChild,
            focusable,
            onEnterReleaseHandler: () => keydownHandlingMethod.current.onEnterRelease(focusableProps),
            onBackPressHandler: (pressedKeys) => keydownHandlingMethod.current.onBackPress(focusableProps, pressedKeys),
            onEnterPressHandler: (pressedKeys) => keydownHandlingMethod.current.onEnterPress(focusableProps, pressedKeys),
            onArrowPressHandler: (dir, pressedKeys) => keydownHandlingMethod.current.onArrowPress(dir, focusableProps, pressedKeys),
            onBecameBlurredHandler: (layout, details) => keydownHandlingMethod.current.onBecameBlurred(layout, focusableProps, details),
            onBecameFocusedHandler: (layout, details) => keydownHandlingMethod.current.onBecameFocused(layout, focusableProps, details),
            onUpdateFocus: (_focused = false) => setFocused(_focused),
            onUpdateHasFocusedChild: (_hasFocusedChild = false) => setHasFocusedChild(_hasFocusedChild),
        })
        return () => spatialNavigation.removeFocusable(realFocusKey);
    }, [])

    useEffect(() => {
        if (isFirstRender.current === false) {
            spatialNavigation.updateFocusable(realFocusKey, {
                node: ref.current,
                preferredChildFocusKey,
                focusable,
                blockNavigationOut: blockNavigationOut,
            })
        } else {
            isFirstRender.current = false;
        }
    })

    const FocusProvider = useMemo(() => {
        const context = {
            parentFocusKey: realFocusKey,
            parentFocusKeyTable: {
                [realFocusKey]: 1 as const,
                ...parentFocusKeyTable
            }
        }
        return ({ children }: { children: ReactNode }) => (
            <Context.Provider value={context}>
                {children}
            </Context.Provider>
        )
    }, []);

    return {
        ref,
        FocusProvider,
        ...focusableProps,
    };
}