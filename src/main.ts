import { MenuScreenController } from "./screens/MenuScreen/MenuScreenController";

// 保证拿到的就是 <div id="container">
const root = document.getElementById("container") as HTMLDivElement;
if (!root) {
    throw new Error('Missing <div id="container"> in index.html');
}

new MenuScreenController(root);
