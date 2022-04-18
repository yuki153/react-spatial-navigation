import React, {
    useContext,
    createContext,
    useEffect,
    useRef,
    type ForwardRefExoticComponent,
    type RefAttributes,
    useState,
    useMemo,
} from "react";
import {
    type PublicComponentProps,
    type FocusableProps,
    spatialNavigation,
    ROOT_FOCUS_KEY
} from "./spatial-navigation";
import {
    issueUniqueId
} from "./unique-id";

const contextObj: Record<"parentFocusKey", string> = { parentFocusKey: ROOT_FOCUS_KEY };
const Context = createContext(contextObj);

type RefComponent<T> = ForwardRefExoticComponent<T & RefAttributes<unknown>>;

export const withFocusable = ({
    forgetLastFocusedChild: configForgetLastFocusedChild = false,
    trackChildren: configTrackChildren = false,
    autoRestoreFocus: configAutoRestoreFocus = undefined as undefined | boolean,
    blockNavigationOut: configBlockNavigationOut = false,
} = {}) => <T, _>(Component: RefComponent<T>) => {
    const FocusableComponent = (p2: PublicComponentProps & Omit<T, keyof FocusableProps>) => {
        const noop = () => {};
        const {
            focusKey = null,
            preferredChildFocusKey = null,
            forgetLastFocusedChild = false,
            trackChildren = false,
            blockNavigationOut = false,
            autoRestoreFocus = true,
            focusable = true,
            onEnterPress = noop,
            onEnterRelease = noop,
            onBecameFocused = noop,
            onBecameBlurred = noop,
            onBackPress = noop,
            onArrowPress = noop,
            onCustomPress = noop,
            ...props
        } = p2;
        const isFirstRender = useRef(true);
        const realFocusKey = useMemo(() => focusKey || issueUniqueId("sn:focusable-item"), []);
        const { parentFocusKey } = useContext(Context);
        const ref = useRef<HTMLElement>(null);
        const [focused, setFocused] = useState(false);
        const [hasFocusedChild, setHasFocusedChild] = useState(false);
        /**
         * receivedProps が 'T' の SubType でない事を明示化する。ジェネリクス(T)として渡された型（自身）へ as T を用いて変換する
         * TS Error の解消：型 'T' の制約に代入できますが、'T' は制約 'FocusableProps' の別のサブタイプでインスタンス化できることがあります
         */
        const receivedProps = {
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
                onEnterReleaseHandler: () => onEnterRelease(receivedProps),
                onEnterPressHandler: (pressedKeys) => onEnterPress(receivedProps, pressedKeys),
                onBackPressHandler: (pressedKeys) => onBackPress(receivedProps, pressedKeys),
                onCustomPressHandler: (customValue, pressedKeys) => onCustomPress(customValue, receivedProps, pressedKeys),
                onArrowPressHandler: (dir, pressedKeys) => onArrowPress(dir, receivedProps, pressedKeys),
                onBecameBlurredHandler: (layout, details) => onBecameBlurred(layout, receivedProps, details),
                onBecameFocusedHandler: (layout, details) => onBecameFocused(layout, receivedProps, details),
                onUpdateFocus: (_focused = false) => setFocused(_focused),
                onUpdateHasFocusedChild: (_hasFocusedChild = false) => setHasFocusedChild(_hasFocusedChild),
            })
            return () => spatialNavigation.removeFocusable(realFocusKey);
        }, [])

        useEffect(() => {
            if (isFirstRender.current === false) {
                // TODO: onEnterPress 関数内の処理が動的に変化する場合、onXxxHandler を update する必要があるかも
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
                <Component {...receivedProps} {...props as T} ref={ref}/>
            </Context.Provider>
        );
    };

    return FocusableComponent;
}