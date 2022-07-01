import { initNavigation } from "../lib";
import { FocusableNavi } from "./components/navi";
import { FocusableContents } from "./components/contents";
import { FocusableHeader } from "./components/header";

initNavigation();

window.addEventListener("keydown", (e) => {
    if (e.keyCode === 8) {
        console.log("window: Backspace key");
    }
})

export const App = () => {
    return (
        <div>
            <FocusableHeader color="#f00"/>
            <div className="flex-wrapper">
                <FocusableNavi />
                <FocusableContents />
            </div>
        </div>
    )
};