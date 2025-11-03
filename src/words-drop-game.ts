import { MenuScreenController } from "./screens/MenuScreen/MenuScreenController";

const root = document.getElementById("container") as HTMLDivElement;
if (!root) throw new Error("Missing #container");

new MenuScreenController(root);
