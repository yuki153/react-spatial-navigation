import { spatialNavigation } from "../lib";
import { FocusableNavi } from "./components/navi";
import { FocusableContents } from "./components/contents";

spatialNavigation.init({});

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