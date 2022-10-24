/**
 * @license See https://github.com/ for full license
 */
import { spatialNavigation, FOCUSED_SELECTOR_NAME, FOCUSED_CLASS_NAME } from "./spatial-navigation";
import type { DirectionKeys } from "./spatial-navigation";
export { withFocusable } from "./with-focusable";
export type { FocusableProps, PublicComponentProps } from "./spatial-navigation";
export type Direction = DirectionKeys;

const { init: initNavigation, setKeyMap } = spatialNavigation;

export {
    initNavigation,
    setKeyMap,
    FOCUSED_SELECTOR_NAME,
    FOCUSED_CLASS_NAME
}
