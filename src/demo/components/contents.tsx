import { ForwardedRef, forwardRef } from "react";
import { FocusableProps, withFocusable } from "../../lib";

const MainItem = ({ className }: FocusableProps, ref: ForwardedRef<HTMLDivElement>) => {
    const space = " ";
    return (
        <div className={`contentMainItem${className ?  space + className : ""}`} ref={ref}>
            <div className={className}/>
            </div>
        );
};

const FocusableMainItem = withFocusable()(forwardRef(MainItem))

const Item = ({ className }: FocusableProps, ref: ForwardedRef<HTMLDivElement>) => {
    const space = " ";
    return <div className={`contentItem${className ? space + className : ""}`} ref={ref}/>
};

const FocusableItem = withFocusable()(forwardRef(Item))

const ItemsWrpper = (_: FocusableProps, ref: ForwardedRef<HTMLDivElement>) => {
    return (
        <div className="contentItems" ref={ref}>
            {[...Array(5)].map((_, i) => <FocusableItem key={`dasfas-${i}`}/>)}
        </div>
    );
};

const FocusableItemsWrpper = withFocusable()(forwardRef(ItemsWrpper))

const Contents = (props: FocusableProps, ref: ForwardedRef<HTMLDivElement>) => {
    return (
        <div className="content" ref={ref}>
            <FocusableMainItem />
            <p className="text">最後に focus した要素を記憶している列</p>
            <FocusableItemsWrpper />
            <p className="text">最後に focus した要素を記憶していない列</p>
            <FocusableItemsWrpper forgetLastFocusedChild={true}/>
        </div>
    )
};

export const FocusableContents = withFocusable()(forwardRef(Contents))