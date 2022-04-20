/**
 * @license See https://github.com/ for full license
 */
import { spatialNavigation, FOCUSED_SELECTOR_NAME, FOCUSED_CLASS_NAME } from "./spatial-navigation";
export { withFocusable } from "./with-focusable";
export type { FocusableProps } from "./spatial-navigation";

const { init: initNavigation, setKeyMap } = spatialNavigation;

export {
    initNavigation,
    setKeyMap,
    FOCUSED_SELECTOR_NAME,
    FOCUSED_CLASS_NAME
}
