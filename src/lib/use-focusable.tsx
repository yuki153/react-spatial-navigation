import {
    type ReactNode,
    useMemo,
    useRef,
    useContext,
    useState,
    useEffect,
    createContext,
} from "react";
import {
    type PublicComponentProps,
    type Component,
    type Details,
    type DirectionKeys,
    type PressedKeys,
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
        onBackPress = null,
        onEnterPress = null,
        onEnterRelease = null,
        onBecameFocused = null,
        onBecameBlurred = null,
        onArrowPress = null,
    } = args;

    const ref = useRef<T>(null);
    const isFirstRender = useRef(true);
    const realFocusKey = useMemo(() => focusKey || issueUniqueId("sn:focusable-item"), []);
    const { parentFocusKey, parentFocusKeyTable } = useContext(Context);
    const [focused, setFocused] = useState(false);
    const [hasFocusedChild, setHasFocusedChild] = useState(false);

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

    const _keydownHandlingMethod = {
        onBackPress: onBackPress && ((pressedKeys: PressedKeys) => onBackPress(focusableProps, pressedKeys)),
        onEnterPress: onEnterPress && ((pressedKeys: PressedKeys) => onEnterPress(focusableProps, pressedKeys)),
        onEnterRelease: onEnterRelease && (() => onEnterRelease(focusableProps)),
        onBecameFocused: onBecameFocused && ((layout: Component["layout"], details: Details) => onBecameFocused(layout, focusableProps, details)),
        onBecameBlurred: onBecameBlurred && ((layout: Component["layout"], details: Details) => onBecameBlurred(layout, focusableProps, details)),
        onArrowPress: onArrowPress && ((dir: DirectionKeys, pressedKeys: PressedKeys) => onArrowPress(dir, focusableProps, pressedKeys)),
    }

    const keydownHandlingMethod = useRef(_keydownHandlingMethod);

    // 常に最新の props（methods）を参照する
    keydownHandlingMethod.current = _keydownHandlingMethod,

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
            getOnEnterRelease: () => keydownHandlingMethod.current.onEnterRelease,
            getOnBackPress: () => keydownHandlingMethod.current.onBackPress,
            getOnEnterPress: () => keydownHandlingMethod.current.onEnterPress,
            getOnArrowPress: () => keydownHandlingMethod.current.onArrowPress,
            getOnBecameBlurred: () => keydownHandlingMethod.current.onBecameBlurred,
            getOnBecameFocused: () => keydownHandlingMethod.current.onBecameFocused,
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