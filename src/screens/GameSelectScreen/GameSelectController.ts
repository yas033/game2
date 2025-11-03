import { GameSelectModel } from "./GameSelectModel";
import { GameSelectView } from "./GameSelectView";
import { WordBubbleGameController } from "../WordBubbleGame/WordBubbleGameController";
import { WordsDropGameController } from "../WordsDropGame/WordsDropGameController";

export class GameSelectController {
    model: GameSelectModel;
    view: GameSelectView;

    constructor(container: string | HTMLDivElement) {
        this.model = new GameSelectModel();
        this.view = new GameSelectView(container);
    }

    start() {
        // give the view the games and a callback for selection
        this.view.render(this.model.games, (id) => {
    if (!id) return;
    const container = document.getElementById("container") as HTMLDivElement;
    container.innerHTML = "";

    if (id === "drop") new WordsDropGameController(container);
    else if (id === "bubble") new WordBubbleGameController(container);
    });
    }
}