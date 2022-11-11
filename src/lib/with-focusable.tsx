import React, {
    useContext,
    createContext,
    useEffect,
    useRef,
    type RefAttributes,
    useState,
    useMemo,
    ReactElement,
} from "react";
import {
    type PublicComponentProps,
    type FocusableProps,
    spatialNavigation,
    ROOT_FOCUS_KEY,
    FOCUSED_CLASS_NAME
} from "./spatial-navigation";
import {
    issueUniqueId
} from "./unique-id";

const contextObj: Record<"parentFocusKey", string> = { parentFocusKey: ROOT_FOCUS_KEY };
const Context = createContext(contextObj);

type Component<P = {}> = {
    (props: P): (ReactElement|null);
    displayName?: string | undefined;
}

export const withFocusable = ({
    forgetLastFocusedChild: configForgetLastFocusedChild = false,
    trackChildren: configTrackChildren = false,
    autoRestoreFocus: configAutoRestoreFocus = undefined as undefined | boolean,
    blockNavigationOut: configBlockNavigationOut = false,
} = {}) => <P, _>(Component: Component<P & RefAttributes<unknown>>) => {
    const FocusableComponent = (p2: PublicComponentProps & Omit<P, keyof FocusableProps | "ref">) => {
        const noop = () => {};
        const _onBackPress = () => false as const;
        const {
            // @ts-ignore
            className = "",
            focusKey = null,
            preferredChildFocusKey = null,
            forgetLastFocusedChild = false,
            trackChildren = false,
            blockNavigationOut = false,
            autoRestoreFocus = true,
            focusable = true,
            onBackPress = _onBackPress,
            onEnterPress = noop,
            onEnterRelease = noop,
            onBecameFocused = noop,
            onBecameBlurred = noop,
            onArrowPress = noop,
            ...props
        } = p2;
        const isFirstRender = useRef(true);
        const realFocusKey = useMemo(() => focusKey || issueUniqueId("sn:focusable-item"), []);
        const { parentFocusKey } = useContext(Context);
        const ref = useRef<HTMLElement>(null);
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

        /**
         * receivedProps が 'T' の SubType でない事を明示化する。ジェネリクス(T)として渡された型（自身）へ as T を用いて変換する
         * TS Error の解消：型 'T' の制約に代入できますが、'T' は制約 'FocusableProps' の別のサブタイプでインスタンス化できることがあります
         */
        const receivedProps = {
            className: focused ? (className ? `${className} ${FOCUSED_CLASS_NAME}` : FOCUSED_CLASS_NAME) : className,
            focusKey: focusKey || null,
            realFocusKey,
            parentFocusKey,
            preferredChildFocusKey,
            setFocus: spatialNavigation.setFocus.bind(spatialNavigation, realFocusKey),
            stealFocus: spatialNavigation.setFocus.bind(spatialNavigation, realFocusKey, realFocusKey),
            focused,
            hasFocusedChild,
            navigateByDirection: spatialNavigation.navigateByDirection.bind(spatialNavigation),
            resumeSpatialNavigation: spatialNavigation.resume.bind(spatialNavigation),
            pauseSpatialNavigation: spatialNavigation.pause.bind(spatialNavigation),
            updateAllSpatialLayouts: spatialNavigation.updateAllLayouts.bind(spatialNavigation),
            getCurrentFocusKey: spatialNavigation.getCurrentFocusKey.bind(spatialNavigation),
        };

        useEffect(() => {
            spatialNavigation.addFocusable({
                node: ref.current,
                focusKey: realFocusKey,
                parentFocusKey: parentFocusKey,
                preferredChildFocusKey,
                forgetLastFocusedChild: (configForgetLastFocusedChild || forgetLastFocusedChild),
                trackChildren: (configTrackChildren || trackChildren),
                blockNavigationOut: (configBlockNavigationOut || blockNavigationOut),
                /**
                 * NOTE: autoRestoreFocus の default 値は true のため、
                 *   configAutoRestoreFocus の値が false の場合でも優先されるようにする。
                 */
                autoRestoreFocus: configAutoRestoreFocus !== undefined ? configAutoRestoreFocus : autoRestoreFocus,
                focusable,
                onEnterReleaseHandler: () => keydownHandlingMethod.current.onEnterRelease(receivedProps),
                onBackPressHandler: (pressedKeys) => keydownHandlingMethod.current.onBackPress(receivedProps, pressedKeys),
                onEnterPressHandler: (pressedKeys) => keydownHandlingMethod.current.onEnterPress(receivedProps, pressedKeys),
                onArrowPressHandler: (dir, pressedKeys) => keydownHandlingMethod.current.onArrowPress(dir, receivedProps, pressedKeys),
                onBecameBlurredHandler: (layout, details) => keydownHandlingMethod.current.onBecameBlurred(layout, receivedProps, details),
                onBecameFocusedHandler: (layout, details) => keydownHandlingMethod.current.onBecameFocused(layout, receivedProps, details),
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
                    blockNavigationOut: (configBlockNavigationOut || blockNavigationOut),
                })
            } else {
                isFirstRender.current = false;
            }
        })
        return (
            <Context.Provider value={{parentFocusKey: realFocusKey}}>
                <Component {...props as P} {...receivedProps} ref={ref}/>
            </Context.Provider>
        );
    };

    return FocusableComponent;
}