import { ResultsScreenView } from "./ResultsScreenView";
import { MenuScreenController } from "../MenuScreen/MenuScreenController";

function loadClick() {
  try {
    const a = new Audio("/sounds/click.wav");
    a.load();
    return a;
  } catch {
    return undefined;
  }
}

export class ResultsScreenController {
  view: ResultsScreenView;
  private click = loadClick();

  constructor(container: string | HTMLDivElement, score: number, hearts: number) {
    this.view = new ResultsScreenView(container, score, hearts, this.backToMenu.bind(this));
  }

  private backToMenu() {
    this.click?.play().catch(() => {});
    const root = (typeof document !== "undefined" && (document.getElementById("container") as HTMLElement)) || document.body;
    root.innerHTML = "";
    new MenuScreenController(root as HTMLDivElement);
} 
}
