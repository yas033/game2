import { MenuScreenController } from "./MenuScreenController";

// Mount the menu on the #container from index.html
const root = (document.getElementById("container") as HTMLElement) || document.body;
new MenuScreenController(root);
