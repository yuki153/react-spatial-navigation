import { initNavigation } from "../lib";
import { FocusableNavi } from "./components/navi";
import { FocusableContents1 } from "./components/contents1";
import { FocusableContents2 } from "./components/contents2";
import { FocusableHeader } from "./components/header";

initNavigation();

window.addEventListener("keydown", (e) => {
    if (e.keyCode === 8) {
        console.log("window: Backspace key");
    }
})

export const App = () => {
    return (
        <div className="app">
            <FocusableHeader color="#f00"/>
            <div className="flex-wrapper">
                <FocusableNavi />
                <FocusableContents1 />
                <FocusableContents2 />
            </div>
        </div>
    )
};