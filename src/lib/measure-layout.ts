type Callback = (width: number, height: number, left: number, top: number) => void;

/** @see https://developer.mozilla.org/ja/docs/Web/API/Node/nodeType */
const ELEMENT_NODE = 1;

const getRect = (node: HTMLElement) => {
    let { offsetParent } = node as unknown as { offsetParent: HTMLElement }; 

    /**
     * overflow container　や viewport の外に要素が存在する場合 height が 0 で返ってしまう。
     * 0 の場合に計算に不都合が生じ、意図せぬ要素に focus が当たってしまうため 1 を代入して対処する。
     */
    const height = node.offsetHeight || 1;

    const width = node.offsetWidth;
    let left = node.offsetLeft;
    let top = node.offsetTop;

    // body 要素からの座標（left, top）を算出する
    while (offsetParent && offsetParent.nodeType === ELEMENT_NODE) {
        left += offsetParent.offsetLeft - offsetParent.scrollLeft; 
        top += offsetParent.offsetTop - offsetParent.scrollTop;
        ({ offsetParent } = offsetParent as unknown as { offsetParent: HTMLElement });
    }

    // TODO: bottom, right property を作ってしまえば、様々な関数内で bottom や right を求める計算式を書かなくて済みそう
    return {
        height,
        left,
        top,
        width
    };
}

/**
 * 第１引数に渡した要素の高さや幅、座標を測定する。測定された値は第２引数の callback 関数の引数から取得できる。
 * @param node
 * @param callback {@link Callback}
 */
export const measureLayout = (node: HTMLElement | null, callback: Callback) => {
    const relativeNode = node && node.parentElement;
    
    if (node && relativeNode) {
        const { height, width, top, left } = getRect(node);
        // TODO: 引数をオブジェクト化して Omit<"node", Component["layout"]> に変更する
        callback(width, height, left, top);
    }
};