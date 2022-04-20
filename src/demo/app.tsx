import { initNavigation } from "../lib";
import { FocusableNavi } from "./components/navi";
import { FocusableContents } from "./components/contents";

initNavigation();

export const App = () => {
    return (
        <div>
            <div className="flex-wrapper">
                <FocusableNavi />
                <FocusableContents />
            </div>
        </div>
    )
};