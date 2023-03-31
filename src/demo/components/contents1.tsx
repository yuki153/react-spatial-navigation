import { ForwardedRef, forwardRef } from "react";
import { FocusableProps, PublicComponentProps, useFocusable, withFocusable } from "../../lib";

const MainItem = ({ className }: FocusableProps, ref: ForwardedRef<HTMLDivElement>) => {
    const space = " ";
    return (
        <div className={`contentMainItem${className ?  space + className : ""}`} ref={ref}>
            <div className={className}/>
            </div>
        );
};

const FocusableMainItem = withFocusable()(forwardRef(MainItem))

const FocusableItem = () => {
    const { FocusProvider, ref, className } = useFocusable();
    const space = " ";
    return (
        <FocusProvider>
            <div className={`contentItem${className ? space + className : ""}`} ref={ref}/>
        </FocusProvider>
    )
};

const FocusableItemsWrpper = (props: PublicComponentProps) => {
    const { FocusProvider, ref } = useFocusable(props);
    return (
        <FocusProvider>
            <div className="contentItems" ref={ref}>
                {[...Array(5)].map((_, i) => <FocusableItem key={`dasfas-${i}`}/>)}
            </div>
        </FocusProvider>
    );
};

const Contents1 = (props: FocusableProps, ref: ForwardedRef<HTMLDivElement>) => {
    return (
        <div className="content1" ref={ref}>
            <FocusableMainItem />
            <p className="text">最後に focus した要素を記憶している列</p>
            <FocusableItemsWrpper />
            <p className="text">最後に focus した要素を記憶していない列</p>
            <FocusableItemsWrpper forgetLastFocusedChild={true}/>
        </div>
    );
};

export const FocusableContents1 = withFocusable()(forwardRef(Contents1));
