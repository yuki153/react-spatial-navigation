import React, {
    type RefAttributes,
    ReactElement,
    memo,
} from "react";
import {
    type PublicComponentProps,
    type FocusableProps,
} from "./spatial-navigation";
import { useFocusable } from "./use-focusable";

type Component<P = {}> = {
    (props: P): (ReactElement|null);
    displayName?: string | undefined;
}

export const withFocusable = ({
    forgetLastFocusedChild: configForgetLastFocusedChild = false,
    trackChildren: configTrackChildren = false,
    autoRestoreFocus: configAutoRestoreFocus = true,
    autoDelayFocusToChild: configAutoDelayFocusToChild = false,
    blockNavigationOut: configBlockNavigationOut = false,
} = {}) => <P, _>(Component: Component<P & RefAttributes<unknown>>) => {
    const FocusableComponent = (
        _props: PublicComponentProps & Omit<P, keyof FocusableProps | "ref"> & { className?: string }
    ) => {
        const {
            className: externalClassName,
            focusKey,
            preferredChildFocusKey,
            forgetLastFocusedChild = configForgetLastFocusedChild,
            trackChildren = configTrackChildren,
            blockNavigationOut = configBlockNavigationOut,
            autoRestoreFocus = configAutoRestoreFocus,
            autoDelayFocusToChild = configAutoDelayFocusToChild,
            focusable,
            onBackPress,
            onEnterPress,
            onEnterRelease,
            onBecameFocused,
            onBecameBlurred,
            onArrowPress,
            ...props
        } = _props;

        const { FocusProvider, ref, ...focus } = useFocusable({
            className: externalClassName,
            focusKey,
            preferredChildFocusKey,
            forgetLastFocusedChild,
            trackChildren,
            blockNavigationOut,
            autoRestoreFocus,
            autoDelayFocusToChild,
            focusable,
            onBackPress,
            onEnterPress,
            onEnterRelease,
            onBecameFocused,
            onBecameBlurred,
            onArrowPress,
        });

        return (
            <FocusProvider>
                <Component
                    {...props as P}
                    {...focus}
                    className={focus.className}
                    ref={ref}
                />
            </FocusProvider>
        );
    };

    const MemoizeFocusableComponent = memo(FocusableComponent);

    return MemoizeFocusableComponent;
}