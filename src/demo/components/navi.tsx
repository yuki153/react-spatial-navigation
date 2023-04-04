import React, { forwardRef, ForwardedRef, useEffect } from "react";
import { withFocusable, FocusableProps } from "../../lib";

type Props = {
    children?: React.ReactNode
    /**
     * FIXME: key が children のみの場合、generics の引数として type Props が渡されても推論から外されてしまう。
     *   TypeScript 4.6.2 で事象を確認。
     **/
    _?: undefined,
} & FocusableProps;

const NaviItem = (props: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const { children, className } = props;
    const space = " "
    return (
        <div className={`naviItem${className ? space + className: ""}`} ref={ref}>{children}</div>
    )
}

const FocusableNaviItem = withFocusable()(forwardRef(NaviItem));

const Navi = (props: FocusableProps, ref: ForwardedRef<HTMLDivElement>) => {
    const space = " ";
    useEffect(() => {
        props.setFocus();
    }, []);

    return (
        <div className={`navi${props.hasFocusedChild ? space + "is-focus" : ""}`} ref={ref}>
            <FocusableNaviItem
                onEnterPress={() => {
                    window.alert("Fire onEnterPress");
                }}
            >
                onEnterPress
            </FocusableNaviItem>
            <FocusableNaviItem
                onBackPress={() => {
                    window.alert("Fire onBackPress");
                }}
            >
                onBackPress
            </FocusableNaviItem>
            <FocusableNaviItem
                onArrowPress={(dir, { navigateByDirection }) => {
                    navigateByDirection(dir);
                    return false;
                }}
            >
                navigateByDirection
            </FocusableNaviItem>
            {[...Array(10)].map((_, i) => (
                <FocusableNaviItem key={`sample-${i}`}>Sample</FocusableNaviItem>
            ))}
        </div>
    );
};

export const FocusableNavi = withFocusable({trackChildren: true})(forwardRef(Navi))