import { throttle } from "mabiki";
import { measureLayout } from "./measure-layout.js";

export const ROOT_FOCUS_KEY = 'SN:ROOT';
export const FOCUSED_CLASS_NAME = "is-spatial-focused";
export const FOCUSED_SELECTOR_NAME = ".is-spatial-focused";

const DIRECTION_LEFT = 'left';
const DIRECTION_RIGHT = 'right';
const DIRECTION_UP = 'up';
const DIRECTION_DOWN = 'down';
const KEY_ENTER = 'enter';
const KEY_BACK = 'back';

/** アクションに対して複数の keycode を登録可能 */
const DEFAULT_KEY_MAP = {
    [DIRECTION_LEFT]: [37, "ArrowLeft"],
    [DIRECTION_UP]: [38, "ArrowUp"],
    [DIRECTION_RIGHT]: [39, "ArrowRight"],
    [DIRECTION_DOWN]: [40, "ArrowDown"],
    [KEY_ENTER]: [13, "Enter"],
    [KEY_BACK]: [8, "Backspace"]
};

const OVERLAP_THRESHOLD = 0.2;

const THROTTLE_OPTIONS = {
    leading: true,
    trailing: false
};

/**
 *  overlap is 5 times more important than sparate gap
 */
const OVERLAP_WEIGHT = 5;
const SEPARATE_GAP_WEIGHT = 1;

/**
 * Main coordinate distance is 5 times more important
 */
const MAIN_COORDINATE_WEIGHT = 5;

type Keys = keyof typeof DEFAULT_KEY_MAP; 

export type DirectionKeys = keyof Omit<typeof DEFAULT_KEY_MAP, "enter" | "back">

type LineSegment = {
    begin: {
        x: number;
        y: number;
    }
    end: {
        x: number;
        y: number;
    }
};

export type Details = Partial<Record<"event", KeyboardEvent>>;

/**
 * 長押し時の情報を提供する
 * @see https://github.com/NoriginMedia/react-spatial-navigation/pull/55
 **/
export type PressedKeys = { pressedKeys: Partial<Record<string, number>> };

export type FocusableProps = {
    className: string | undefined;
    focusKey: string;
    parentFocusKey: string;
    focused: boolean;
    hasFocusedChild: boolean;
    setFocus: (focusKey?: string, detail?: any) => void;
    stealFocus: (detail?: any) => void;
    navigateByDirection: (dir: DirectionKeys) => void;
    pauseSpatialNavigation: () => void;
    resumeSpatialNavigation: () => void;
    updateAllSpatialLayouts: () => void;
    getCurrentFocusKey: () => string | null;
}

export type PublicComponentProps = {
    className?: string;
    focusKey?: string;
    focusable?: boolean;
    forgetLastFocusedChild?: boolean;
    trackChildren?: boolean;
    blockNavigationOut?: boolean;
    onBackPress?: (ownProps: FocusableProps, pressedKeys: PressedKeys) => void | false;
    onEnterPress?: (ownProps: FocusableProps, pressedKeys: PressedKeys) => void;
    onEnterRelease?: (ownProps: FocusableProps) => void;
    onArrowPress?: (dir: DirectionKeys, ownProps: FocusableProps, pressedKeys: PressedKeys) => void | false;
    onBecameFocused?: (layout: Component["layout"], ownProps: FocusableProps, details: Details) => void;
    onBecameBlurred?: (layout: Component["layout"], ownProps: FocusableProps, details: Details) => void;
    autoRestoreFocus?: boolean;
    autoDelayFocusToChild?: boolean;
    preferredChildFocusKey?: string | null;
}

export type ComponentProps = {
    node: HTMLElement | null;
    focusKey: string;
    parentFocusKey: string;
    parentFocusKeyTable: Record<string, 1>
    focusable: boolean;
    blockNavigationOut: boolean;
    preferredChildFocusKey: string | null;
    forgetLastFocusedChild: boolean;
    trackChildren: boolean;
    autoRestoreFocus: Boolean;
    autoDelayFocusToChild: boolean;
    getOnBackPress: () => ((pressedKeys: PressedKeys) => void | false) | null;
    getOnEnterPress: () => ((pressedKeys: PressedKeys) => void) | null;
    getOnEnterRelease: () => (() => void) | null;
    getOnArrowPress: () => ((dir: DirectionKeys, pressedKeys: PressedKeys) => void | false) | null;
    getOnBecameFocused: () => ((layout: Component["layout"], details: Details) => void) | null;
    getOnBecameBlurred: () => ((layout: Component["layout"], details: Details) => void) | null;
    onUpdateFocus: (bool: boolean) => void;
    onUpdateHasFocusedChild: (bool: boolean) => void;
}

export type Component = {
    lastFocusedChildKey: null | string;
    layout: {
        /** width */
        width: number;
        /** height */
        height: number;
        /** 画面（body）からの上辺の y 座標 */
        top: number;
        /** 画面（body）からの左辺の x 座標 */
        left: number;
        node: HTMLElement | null;
    }
} & ComponentProps;

class SpatialNavigation {
    
    /** 全ての focus 可能なコンポーネントのストレージ */
    private focusableComponents: Record<string, Component> = {};
    
    /** 現在 focus されている要素の foucsKey を保存 */
    private focusKey: string | null = null;
    
    /** 現在 focus されている要素の全ての親の focusKey を保存 */
    private parentsHavingFocusedChild: string[] = [];

    /** spatial navigation 有効化フラグ */
    private enabled = false;

    /** spatial navigation の主要イベントをブロックするためのフラグ */
    private paused = false;

    private throttle = 0;
    private throttleKeypresses = false;

    private pressedKeys: PressedKeys["pressedKeys"] = {};
    
    private keyMap = DEFAULT_KEY_MAP;

    /** document.addEventListener 内での this はデフォルトで window を参照するため this の値を固定する */
    private eventHandler = {
        keyDownEvent: this.keyDownEvent.bind(this),
        keyUpEvent: this.keyUpEvent.bind(this),
    }
    
    constructor() {
        this.init = this.init.bind(this);
        this.setKeyMap = this.setKeyMap.bind(this);
    }

    public init({
        throttle: _throttle = 0,
        throttleKeypresses: throttleKeypresses = false
    } = {}) {
        if (!this.enabled) {
            this.enabled = true;
            this.throttleKeypresses = throttleKeypresses;
            if (Number.isInteger(_throttle) && _throttle > 0) {
                this.throttle = _throttle;
                this.eventHandler.keyDownEvent = throttle(
                    this.keyDownEvent.bind(this),
                    this.throttle,
                    THROTTLE_OPTIONS
                );
            }
            this.bindEventHandlers();
        }
    }

    public destroy() {
        if (this.enabled) {
            this.enabled = false;
            this.throttle = 0;
            this.throttleKeypresses = false;
            this.focusKey = null;
            this.parentsHavingFocusedChild = [];
            this.focusableComponents = {};
            this.paused = false;
            this.keyMap = DEFAULT_KEY_MAP;
            this.unbindEventHandlers();
        }
    }

    public setKeyMap(keys:  Partial<typeof DEFAULT_KEY_MAP>) {
        this.keyMap = {
            ...DEFAULT_KEY_MAP,
            ...keys
        }
    }

    /**
     * isIncremental（down, right）な場合、要素の右辺または下辺の座標を返す。  
     * そうでない場合、要素の左辺または上辺の座標を返す。
     * @return {number} {@link getDestinationCoordinate} が返す座標と比較するための座標を返す
     */
    private getOriginCoordinate(isVertical: boolean, isIncremental: boolean, layout: Component["layout"]) {
        const { top, left, width, height } = layout;

        const coordinate = isVertical ? top : left;
        const itemSize = isVertical ? height : width;
        
        return isIncremental ? coordinate + itemSize : coordinate;
    }

    /**
     * isIncremental（down, right）な場合、要素の左辺または上辺の座標を返す。  
     * そうでない場合、要素の右辺または下辺の座標を返す。
     * @return {number} {@link getOriginCoordinate} が返す座標と比較するための座標を返す。
     */
    private getDestinationCoordinate(isVertical: boolean, isIncremental: boolean, layout: Component["layout"]) {
        const { top, left, width, height } = layout;

        const coordinate = isVertical ? top : left;
        const itemSize = isVertical ? height : width;
        
        return isIncremental ? coordinate : coordinate + itemSize;
    }

    /**
     * {@link Component}（Rect）の一辺を線分として見立て、その始端と終点の座標情報（x,y）を返す。
     * 始端は常に線分の左端または上端となり、終端は常に右端または下端となる。
     */
    private getLineSegment (direction: Keys, isSibling: boolean, layout: Component["layout"]) {
        const lineSegment: LineSegment = {
            begin: {
                x: 0,
                y: 0
            },
            end: {
                x: 0,
                y: 0
            }
        }
        switch(direction) {
            case DIRECTION_UP: {
                const y = isSibling ? layout.height + layout.top : layout.top;
                lineSegment.begin = {
                    x: layout.left,
                    y
                }
                lineSegment.end = {
                    x: layout.left + layout.width,
                    y
                }
                break;
            }
            case DIRECTION_DOWN: {
                const y = isSibling ? layout.top : layout.top + layout.height;
                lineSegment.begin = {
                    x: layout.left,
                    y
                }
                lineSegment.end = {
                    x: layout.left + layout.width,
                    y
                }
                break;
            }
            case DIRECTION_LEFT: {
                const x = isSibling ? layout.left + layout.width : layout.left;
                lineSegment.begin = {
                    x,
                    y: layout.top
                }
                lineSegment.end = {
                    x,
                    y: layout.top + layout.height
                }
                break;
            }
            case DIRECTION_RIGHT: {
                const x = isSibling ? layout.left : layout.left + layout.width;
                lineSegment.begin = {
                    x,
                    y: layout.top
                }
                lineSegment.end = {
                    x,
                    y: layout.top + layout.height
                }
                break;
            }
            default:
                break;
        }
        return lineSegment;
    }

    private calculateOverlap(originLineSegment: LineSegment, destinationLineSegment: LineSegment, isVertical: boolean) {
        const axis = isVertical ? 'x' : 'y';
        const overlapJudgmentValue = (originLineSegment.end[axis] - originLineSegment.begin[axis]) * OVERLAP_THRESHOLD;

        const endCoordinate = Math.min(originLineSegment.end[axis], destinationLineSegment.end[axis]);
        const beginCoordinate = Math.max(originLineSegment.begin[axis], destinationLineSegment.begin[axis]);

        const intersectionLength = Math.max(0, endCoordinate - beginCoordinate);
        return intersectionLength >= overlapJudgmentValue;
    }

    /** direction に対して垂直な origin と destination の距離（絶対値）を求める */
    private getPrimaryAxisDistance(originLineSegment: LineSegment, destinationLineSegment: LineSegment, isVertical: boolean) {
        const axis = isVertical ? 'y' : 'x';
        // begin 同士を引き算しているが、ここでは begin[axis] と end[axis] は同値のため end 同士の引き算でも結果は同じとなる
        return Math.abs(originLineSegment.begin[axis] - destinationLineSegment.begin[axis]);
    }

    /** origin と destination の分離軸上（separate axis）の gap を求める */
    private getSecondaryAxisDistance(originLineSegment: LineSegment, destinationLineSegment: LineSegment, isVertical: boolean) {
        const axis = isVertical ? 'x' : 'y';
        const distancesToCompare = [];

        distancesToCompare.push(Math.abs(destinationLineSegment.begin[axis] - originLineSegment.begin[axis]));
        distancesToCompare.push(Math.abs(destinationLineSegment.begin[axis] - originLineSegment.end[axis]));
        distancesToCompare.push(Math.abs(destinationLineSegment.end[axis] - originLineSegment.begin[axis]));
        distancesToCompare.push(Math.abs(destinationLineSegment.end[axis] - originLineSegment.end[axis]));

        return Math.min(...distancesToCompare);
    }


    private sortSiblingsByPriority(siblings: Component[], currentLayout: Component["layout"], direction: Keys, focusKey: string) {
        const isVertical = direction === DIRECTION_DOWN || direction === DIRECTION_UP;

        const originLineSegment = this.getLineSegment(
            direction,
            false,
            currentLayout
        );

        const calculated: Record<string, { priority: number }> = {}

        return siblings.sort((a, b) => {
            const sortArgs = [a, b];

            for (let i = 0; i < 2; i++) {
                const sibling = sortArgs[i];

                // sort ループ内で既に計算済みの要素はスキップする
                if (calculated[sibling.focusKey] === undefined) {
                    const destinationLineSegment = this.getLineSegment(direction, true, sibling.layout)
                    const hasOverlap = this.calculateOverlap(originLineSegment, destinationLineSegment, isVertical);

                    // 進路上に重さなる要素（overlap element）がある場合、進路上の overlap element と origin の距離を優先値として取得する。
                    // 進路上に重さなる要素がない場合、not overlap element と origin の分離軸上の gap の値を優先値として取得する。
                    const primaryAxisFunction = hasOverlap ?
                        this.getPrimaryAxisDistance :
                        this.getSecondaryAxisDistance;

                    const secondaryAxisFunction = hasOverlap ?
                        this.getSecondaryAxisDistance :
                        this.getPrimaryAxisDistance;
                    
                    const primaryAxisDistance = primaryAxisFunction(originLineSegment, destinationLineSegment, isVertical);
                    const secondaryAxisDistance = secondaryAxisFunction(originLineSegment, destinationLineSegment, isVertical);

                    /**
                     * この値が高いほど、候補者の優先順位は低くなります。
                     */
                    const totalDistancePoints = (primaryAxisDistance * MAIN_COORDINATE_WEIGHT) + secondaryAxisDistance;

                    /**
                     * + 1 here is in case of distance is zero, but we still want to apply Adjacent priority weight
                     * hasOverlap が true の場合 false の場合より５倍重要（priorty の値が５倍小さくなる）
                     */
                    const priority = (totalDistancePoints + 1) / (hasOverlap ? OVERLAP_WEIGHT : SEPARATE_GAP_WEIGHT);
                
                    console.log(
                        '%c[sortSiblingsByPriority]', 'color:crimson',
                        `distance (primary, secondary, total weighted) for ${sibling.focusKey} relative to ${focusKey} is`,
                        primaryAxisDistance,
                        secondaryAxisDistance,
                        totalDistancePoints
                    );
                
                    console.log(
                        '%c[sortSiblingsByPriority]', 'color:crimson',
                        `priority for ${sibling.focusKey} relative to ${focusKey} is`,
                        priority
                    );
                    calculated[sibling.focusKey] = { priority };
                }
            }
            return calculated[a.focusKey].priority - calculated[b.focusKey].priority;
        })
    }

    private getEventType<T extends Record<string, (number | string)[]> = typeof DEFAULT_KEY_MAP>(keyCode: number | string, keyMap: T = this.keyMap as unknown as T) {
        const keys = Object.keys(keyMap) as (keyof T)[]
        for (let i = 0; i < keys.length; i++) {
            if(keyMap[keys[i]].indexOf(keyCode) !== -1) {
                return keys[i];
            }
        }
        return null;
    }

    private keyDownEvent(event: KeyboardEvent) {
        const focusKey = this.focusKey;
        if (this.paused || !focusKey) {
            return;
        }

        const eventType = this.getEventType(event.keyCode || event.key);

        if (!eventType) {
            return;
        }

        const pressedEventType = this.pressedKeys[eventType];
        this.pressedKeys[eventType] = pressedEventType ? pressedEventType + 1 : 1;

        const details = {
            pressedKeys: this.pressedKeys
        };

        if(eventType === KEY_BACK) {
            const stopPropagation = this.onBackPress(focusKey, details);
            if (stopPropagation === false) {
                event.preventDefault();
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if(eventType === KEY_ENTER) {
            this.onEnterPress(focusKey, details);
            return;
        }

        const preventDefaultNavigation = this.onArrowPress(focusKey, eventType, details);

        if (preventDefaultNavigation === false) {
            console.log('%c[keyDownEvent]', 'color:deepskyblue', 'default navigation prevented');
        } else {
            this.onKeyEvent(event, eventType)
        }
    }

    private keyUpEvent(event: KeyboardEvent) {
        const focusKey = this.focusKey;
        if (!focusKey || this.paused) {
            return;
        }
        const eventType = this.getEventType(event.keyCode);
        if (eventType && this.pressedKeys[eventType]) {
            delete this.pressedKeys[eventType];
        }
        if (this.throttle && !this.throttleKeypresses) {
            (this.eventHandler.keyDownEvent as ReturnType<typeof throttle>).cancel();
        }
        if (eventType === KEY_ENTER) {
            this.onEnterRelease(focusKey);
        }
    }

    /**
     * NOTE: オリジナルとの差分として、bindEventHandlers 関数内で keyDownEvent/KeyUpEvent を定義せず、メンバー関数として分離。
     */
    private bindEventHandlers() {
        if (typeof window !== 'undefined') {
            document.addEventListener("keydown", this.eventHandler.keyDownEvent);
            document.addEventListener("keyup", this.eventHandler.keyUpEvent);
        }
    }

    private unbindEventHandlers() {
        if (typeof window !== 'undefined') {
            document.removeEventListener("keydown", this.eventHandler.keyDownEvent);
            document.removeEventListener("keyup", this.eventHandler.keyUpEvent);
        }
    }

    public navigateByDirection(direction: DirectionKeys, details = {}) {
        if (this.paused) {
            return;
        }
        const validDirections = [DIRECTION_DOWN, DIRECTION_UP, DIRECTION_LEFT, DIRECTION_RIGHT];

        if (validDirections.indexOf(direction) < 0) {
            console.log(
                '[navigateByDirection]',
                `Invalid direction. You passed: \`${direction}\`, but you can use only these: `,
                validDirections
            );
            return;
        }
        console.log('[navigateByDirection]', 'direction', direction);
        this.smartNavigate(direction, null, details);
    }

    /**
     * smartNavigate を実行する。
     *
     * NOTE: オリジナルとの差分として、内部処理を削減のために第２引数に direction を渡すように変更。
     **/
    private onKeyEvent(event: KeyboardEvent, direction: DirectionKeys) {
        this.smartNavigate(direction, null, {event});
    }

    /** 
     * direction に基づき、兄弟間を移動するか、親階層へ移動します。
     *
     * NOTE: オリジナルとの差分として sortSiblingsByPriority 実行前に条件分岐を追加
     **/
    private smartNavigate(direction: Keys, fromParentFocusKey: string | null, details: Details) {
        console.log('%c[smartNavigate]', 'color:orange', 'direction', direction);
        console.log('%c[smartNavigate]', 'color:orange', 'fromParentFocusKey', fromParentFocusKey);
        console.log('%c[smartNavigate]', 'color:orange', 'this.focusKey', this.focusKey);

        const currentFocusKey = fromParentFocusKey || this.focusKey;

        if (!currentFocusKey) {
            return;
        }

        const currentComponent = this.focusableComponents[currentFocusKey];

        // currentFocusKey が SN:ROOT だった場合 currentComponent は undefined になる
        if (!currentComponent) {
            console.log('%c[smartNavigate]', 'color:orange', 'currentComponent', currentComponent);
            return;
        }

        console.log('%c[smartNavigate]', 'color:orange', 'currentComponent', currentComponent.focusKey, currentComponent);

        this.updateLayout(currentComponent.focusKey);
        const { parentFocusKey, focusKey, layout } = currentComponent;

        const isVertical = direction === DIRECTION_DOWN || direction === DIRECTION_UP;
        const isIncremental = direction === DIRECTION_DOWN || direction === DIRECTION_RIGHT;

        const originCoordinate = this.getOriginCoordinate(isVertical, isIncremental, layout);

        const focusKeys = Object.keys(this.focusableComponents);

        /**
         * 押された方向に対して focus 移動できる座標を持つ全ての兄弟コンポーネント
         */
        const focusableSiblings: Component[] = [];

        // performance 考慮から map, fillter を使用せず for 文で push を行う
        for (let i = 0; i < focusKeys.length; i++) {
            const component = this.focusableComponents[focusKeys[i]];
            if (component.parentFocusKey === parentFocusKey && component.focusable) {
                this.updateLayout(component.focusKey);
                const destinationCoordinate = this.getDestinationCoordinate(isVertical, isIncremental, component.layout);

                const isFocusable = isIncremental ? 
                    destinationCoordinate >= originCoordinate :
                    destinationCoordinate <= originCoordinate;

                if (isFocusable) {
                    focusableSiblings.push(component);
                }
            }
        }

        if (focusableSiblings.length) {

            const sortedSiblings = this.sortSiblingsByPriority(
                focusableSiblings,
                layout,
                direction,
                focusKey
            );

            const nextComponent = sortedSiblings[0];
            this.__setFocus(nextComponent.focusKey, details);
        } else {
            const parentComponent = this.focusableComponents[parentFocusKey];
            if (parentComponent) {
                this.saveLastFocusedChildKey(parentComponent, focusKey);
            }
            if (!parentComponent || !parentComponent.blockNavigationOut) {
                this.smartNavigate(direction, parentFocusKey, details);
            }
        }
    }
    
    private isParticipatingFocusableComponent(focusKey: string) {
        const component = this.focusableComponents[focusKey];
        return component ? component.focusable : false;
    }

    /**
     * 引数に与えられた focusKey（FocusableComponent）の　tree 上の最下層の focusKey を返します
     */
    private getNextFocusKey(targetFocusKey: string): string {
        const targetComponent = this.focusableComponents[targetFocusKey];

        /**
         * Security check, if component doesn't exist, stay on the same focusKey
         * smartNavigate 関数内で focusableComponents から focusKey を抽出しているため undefind になる事はなさそうだが、
         *   念のため、オリジナルと同様 undefind チェックを残しておく。
         */
        if (!targetComponent) {
            return targetFocusKey;
        }

        const children: Component[] = [];
        const keys = Object.keys(this.focusableComponents);
        for (let i = 0; i < keys.length; i++) {
            const component = this.focusableComponents[keys[i]];
            if (component.parentFocusKey === targetFocusKey && component.focusable) {
                children.push(component);
            }
        }

        if (children.length) {
            const { lastFocusedChildKey, preferredChildFocusKey } = targetComponent;
            console.log('%c[getNextFocusKey]', 'color:goldenrod', 'lastFocusedChildKey is', lastFocusedChildKey);
            console.log('%c[getNextFocusKey]', 'color:goldenrod', 'preferredChildFocusKey is', preferredChildFocusKey);

            // 1. まず第一に、最後に focus した子要素の focusKey を返します。
            if (lastFocusedChildKey &&
                !targetComponent.forgetLastFocusedChild &&
                this.isParticipatingFocusableComponent(lastFocusedChildKey)
            ) {
                console.log('%c[getNextFocusKey]', 'color:goldenrod', 'lastFocusedChildKey will be focused', lastFocusedChildKey);
                const focusKey = this.getNextFocusKey(lastFocusedChildKey);
                this.updateLayout(focusKey);
                return focusKey;
            }

            // 2. lastFocusedChild がない場合は、preferredChildFocusKey に focus します。
            if (preferredChildFocusKey && this.isParticipatingFocusableComponent(preferredChildFocusKey)) {
                console.log('%c[getNextFocusKey]', 'color:goldenrod', 'preferredChildFocusKey will be focused', preferredChildFocusKey);
                const focusKey = this.getNextFocusKey(preferredChildFocusKey)
                this.updateLayout(focusKey);
                return focusKey;
            }

            for (let i = 0; i < children.length; i++) {
                this.updateLayout(children[i].focusKey);
            }

            // 3. それ以外の場合、最も原点（x:0, y:0）に近い子要素へ focus します。
            const child = children.reduce((prev, current) => {
                const prevDistance = Math.abs(prev.layout.left) + Math.abs(prev.layout.top);
                const currentDistance = Math.abs(current.layout.left) + Math.abs(current.layout.top);
                return currentDistance < prevDistance ? current : prev;
            })
            console.log('%c[getNextFocusKey]', 'color:goldenrod', 'childKey will be focused', child.focusKey);
            return this.getNextFocusKey(child.focusKey);
        }

        // 引数に与えられた focusKey が最下層だった場合、そのまま return する。
        console.log('%c[getNextFocusKey]', 'color:goldenrod', 'targetFocusKey', targetFocusKey);
        return targetFocusKey;
    }

    public addFocusable({
        node,
        focusKey,
        parentFocusKey,
        parentFocusKeyTable,
        focusable,
        blockNavigationOut,
        preferredChildFocusKey,
        forgetLastFocusedChild,
        trackChildren,
        autoRestoreFocus,
        autoDelayFocusToChild,
        getOnBackPress,
        getOnEnterPress,
        getOnEnterRelease,
        getOnArrowPress,
        getOnBecameFocused,
        getOnBecameBlurred,
        onUpdateFocus,
        onUpdateHasFocusedChild,
    }: ComponentProps) {
        this.focusableComponents[focusKey] = {
            node,
            focusKey,
            parentFocusKey,
            parentFocusKeyTable,
            focusable,
            blockNavigationOut,
            preferredChildFocusKey,
            forgetLastFocusedChild,
            trackChildren,
            autoRestoreFocus,
            autoDelayFocusToChild,
            getOnBackPress,
            getOnEnterPress,
            getOnEnterRelease,
            getOnArrowPress,
            getOnBecameFocused,
            getOnBecameBlurred,
            onUpdateFocus,
            onUpdateHasFocusedChild,
            lastFocusedChildKey: null,
            layout: {
                width: 0,
                height: 0,
                left: 0,
                top: 0,
                node
            }
        }
        this.updateLayout(focusKey);
        /**
         * If for some reason this component was already focused before it was added, call the update
         */
        if (focusKey === this.focusKey) {
            this.__setFocus(focusKey);
        }
        /**
         * 追加された子の親が既に focus されていた場合に、子に focus する。
         */
        if (parentFocusKey === this.focusKey) {
            const parentComponent = this.focusableComponents[parentFocusKey];
            if (parentComponent && parentComponent.autoDelayFocusToChild) {
                const { preferredChildFocusKey } = parentComponent;
                preferredChildFocusKey
                    ? preferredChildFocusKey === focusKey && this.__setFocus(focusKey)
                    : this.__setFocus(focusKey);
            } 
        }

        /**
         * 既に子に focus されていた場合、親の hasFocusedChild state を true に更新する。
         */
        const focusedComponent = this.focusKey && this.focusableComponents[this.focusKey];
        const addedComponent = this.focusableComponents[focusKey]; 
        if (addedComponent && focusedComponent && focusedComponent.parentFocusKeyTable[focusKey]) {
            trackChildren && onUpdateHasFocusedChild(true);
            const onBecameFocused = getOnBecameFocused();
            focusable && onBecameFocused && onBecameFocused(addedComponent.layout, {});
            this.parentsHavingFocusedChild.push(focusKey);
        }
    }

    public removeFocusable(focusKey: string) {
        const componentToRemove = this.focusableComponents[focusKey];
        if (componentToRemove) {
            const { parentFocusKey } = componentToRemove;
            delete this.focusableComponents[focusKey];

            const parentComponent = this.focusableComponents[parentFocusKey];
            const isFocused = focusKey === this.focusKey;

            if (parentComponent) {
                parentComponent.lastFocusedChildKey = focusKey
                    && (parentComponent.lastFocusedChildKey = null);
                isFocused && parentComponent.autoRestoreFocus && this.__setFocus(parentFocusKey);
            }
        }
    }

    /**
     * this.focusKey を第一引数の newFocusKey へ更新する。
     * 第一引数の newFocusKey に紐づく FocusableComponent を focused な状態に変更して、
     *   前に focus されていた FocusableComponent を非 focusd な状態に更新する
     *
     * NOTE: オリジナルとの差分として、この関数内では saveLastFocusedChildKey を行わない。
     *   後続で実行する updateParentsLastFocusedChild 関数内で実行で事足りるため。
     */
    private setCurrentFocusedKey(newFocusKey: string, details: Details) {
        const oldFocusKey = this.focusKey;
        const oldComponent = oldFocusKey && this.focusableComponents[oldFocusKey];
        if (oldComponent && newFocusKey !== oldFocusKey) { 
            oldComponent.onUpdateFocus(false);
            const onBecameBlurred = oldComponent.getOnBecameBlurred();
            onBecameBlurred && onBecameBlurred(oldComponent.layout, details);
        }

        this.focusKey = newFocusKey;

        if (this.focusableComponents[newFocusKey]) {
            const newComponent = this.focusableComponents[newFocusKey]
            newComponent.onUpdateFocus(true);
            const onBecameFocused = newComponent.getOnBecameFocused();
            onBecameFocused && onBecameFocused(newComponent.layout, details);
        }
    }

    public getCurrentFocusKey() {
        return this.focusKey;
    }

    /**
     * 最後に focus された FocusableComponent の focuskey を parentComponent の lastFocusedChildKey property に保存する。
     * @param component parentComponent
     * @param focusKey 第一引数の lastFocusedChildKey として登録する focusKey
     */
    private saveLastFocusedChildKey(component: Component, focusKey: string) {
        console.log('%c[saveLastFocusedChildKey]', 'color:limegreen', `parent(${component.focusKey}) lastFocusedChildKey set`, focusKey);
        component.lastFocusedChildKey = focusKey;
    }

    /**
     * 第一引数に与えられた focusKey の全ての parentComponent で {@link saveLastFocusedChildKey} を実行する。
     */
    private updateParentsLastFocusedChild(focusKey: string) {
        let currentComponent = this.focusableComponents[focusKey];

        /** Recursively iterate the tree up and update all the parent's lastFocusedChild */
        while (currentComponent) {
            const { parentFocusKey } = currentComponent;
            const parentComponent = this.focusableComponents[parentFocusKey];

            if (parentComponent) {
                this.saveLastFocusedChildKey(parentComponent, currentComponent.focusKey);
            }

            currentComponent = parentComponent;
        }
    }

    /**
     * this.parentsHasFocusedChild を更新する。
     * それに影響を受ける trackChildren が有効な FocusableParentComponent の hasFocusableChild prop を変更する。
     */
    private updateParentsHasFocusedChild(focusKey: string, details: Details) {
        const parents: string[] = [];

        /** loop 処理内で parents 配列内の値の検索を最適化するための変数 */
        const parentsTable: Record<string, number> = {}
        let currentComponent = this.focusableComponents[focusKey];

        while (currentComponent) {
            const { parentFocusKey } = currentComponent;
            const parentComponent = this.focusableComponents[parentFocusKey];

            if (parentComponent) {
                const { focusKey: currentParentFocusKey } = parentComponent;
                parents.push(currentParentFocusKey);
                parentsTable[currentParentFocusKey] = 1;
            }
            currentComponent = parentComponent;
        }

        const parentsWithRemoveFlag = this.parentsHavingFocusedChild.filter((key) => {
            parentsTable[key] = parentsTable[key] || 0;
            return !parentsTable[key];
        });
        const parentsWithAddFlag = parents.filter((key) => {
            return parentsTable[key];
        });

        for (let i = 0; i < parentsWithRemoveFlag.length; i++) {
            const parentFocusKey = parentsWithRemoveFlag[i];
            const parentComponent = this.focusableComponents[parentFocusKey];
            if (parentComponent) {
                parentComponent.trackChildren && parentComponent.onUpdateHasFocusedChild(false);
                const onBecameBlurred = parentComponent.getOnBecameBlurred();
                if (parentComponent.focusable && onBecameBlurred) {
                    this.updateLayout(parentComponent.focusKey);
                    onBecameBlurred(parentComponent.layout, details);
                }
            }
        }

        for (let i = 0; i < parentsWithAddFlag.length; i++) {
            const parentFocusKey = parentsWithAddFlag[i];
            const parentComponent = this.focusableComponents[parentFocusKey];
            if (parentComponent) {
                parentComponent.trackChildren && parentComponent.onUpdateHasFocusedChild(true);
                const onBecameFocused = parentComponent.getOnBecameFocused();
                if (parentComponent.focusable && onBecameFocused) {
                    this.updateLayout(parentComponent.focusKey);
                    onBecameFocused(parentComponent.layout, details);
                }
            }
        }

        this.parentsHavingFocusedChild = parents;
    }

    public pause() {
        this.paused = true;
    }

    public resume() {
        this.paused = false;
    }

    private __setFocus(focusKey: string, details: Details = {}, enableLayoutUpdate: boolean = false) {
        if (!this.enabled) {
            return;
        }
        console.log('%c[setFocus]', 'color:gold', 'targetFocusKey', focusKey);
        const oldFocusKey = this.focusKey;
        const newFocusKey = this.getNextFocusKey(focusKey);
        console.log('%c[setFocus]', 'color:gold', 'newFocusKey', newFocusKey, this.focusableComponents[newFocusKey]);
        if (enableLayoutUpdate) {
            oldFocusKey && this.updateLayout(oldFocusKey);
            focusKey === newFocusKey && this.updateLayout(newFocusKey);
        }
        this.setCurrentFocusedKey(newFocusKey, details);
        this.updateParentsHasFocusedChild(newFocusKey, details);
        oldFocusKey && this.updateParentsLastFocusedChild(oldFocusKey);
    }

    public setFocus(focusKey: string, overwriteFocusKey?: string, details: Details = {}) {
        const targetFocusKey = overwriteFocusKey || focusKey;
        this.__setFocus(targetFocusKey, details, true);
    }

    private onEnterRelease(focusKey: string) {
        const component = this.focusableComponents[focusKey];
        if (!component || !component.focusable) {
            console.log("[onEnterRelease]", 'noComponent or componentNotFocusable');
            return;
        }
        const onEnterRelease = component.getOnEnterRelease();
        onEnterRelease && onEnterRelease();
    }

    private onBackPress(focusKey: string, pressedKeys: PressedKeys) {
        const component = this.focusableComponents[focusKey];
        if (!component || !component.focusable) {
            console.log('[onBackPress]', 'noComponent or componentNotFocusable');
            return false;
        }
        const onBackPress = component.getOnBackPress();
        return onBackPress ? onBackPress(pressedKeys) : false;
    }

    private onEnterPress(focusKey: string, pressedKeys: PressedKeys) {
        const component = this.focusableComponents[focusKey];
        if (!component || !component.focusable) {
            console.log('[onEnterPress]', 'noComponent or componentNotFocusable');
            return;
        }
        const onEnterPress = component.getOnEnterPress();
        onEnterPress && onEnterPress(pressedKeys);
    }

    private onArrowPress(focusKey: string, direction: DirectionKeys, pressedKeys: PressedKeys): void | false {
        const component = this.focusableComponents[focusKey];
        if (!component) {
            console.log('[onArrowPress]', 'noComponent');
            return false;
        }
        const onArrowPress = component.getOnArrowPress();
        return onArrowPress ? onArrowPress(direction, pressedKeys) : undefined;
    }

    /**
     * {@link Component} の layout 情報を全て再測定して更新する。
     */
    public updateAllLayouts() {
        const focusKeys = Object.keys(this.focusableComponents);
        for (let i = 0; i < focusKeys.length; i++) {
            this.updateLayout(focusKeys[i]);
        }
    }
    
    private updateLayout(focusKey: string) {
        const component = this.focusableComponents[focusKey];
        if (!component) {
            return;
        }
        
        const { node } = component;
        measureLayout(node, (width, height, left, top) => {
            component.layout = {
                width,
                height,
                left,
                top,
                node
            }
        })
    }

    public updateFocusable(
        focusKey: string,
        updateOption: {
            node: HTMLElement | null
            preferredChildFocusKey: string | null,
            focusable: boolean,
            blockNavigationOut: boolean,
        }
    ) {
        const component = this.focusableComponents[focusKey];

        if (!component) {
            console.log("[updateFocusable]", "noComponnt");
        }

        component.preferredChildFocusKey = updateOption.preferredChildFocusKey;
        component.focusable = updateOption.focusable;
        component.blockNavigationOut = updateOption.blockNavigationOut;
        component.node = updateOption.node || component.node;
    }
}

export const spatialNavigation = new SpatialNavigation();
