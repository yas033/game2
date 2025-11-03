import { ResultsScreenController } from "./screens/ResultsScreen/ResultsScreenController";
const root = document.getElementById("container") as HTMLDivElement;

if (!root) {
    throw new Error("Missing <div id='container'> in index.html");
}

// GameOver / MiniGame Hub page
new ResultsScreenController(root, 0, 0);
