import { MenuScreenView } from "./MenuScreenView";
import { GameScreenController } from "./GameScreenController";

function loadClick() {
  try {
    const a = new Audio("/sounds/click.wav");
    a.load();
    return a;
  } catch {
    return undefined;
  }
}

export class MenuScreenController {
  view: MenuScreenView;
  private click = loadClick();

  constructor(container: string | HTMLDivElement) {
    this.view = new MenuScreenView(container, this.startGame.bind(this));
  }

  private startGame() {
    this.click?.play().catch(() => {});
    const root = (typeof document !== "undefined" && (document.getElementById("container") as HTMLElement)) || document.body;
    root.innerHTML = "";
    new GameScreenController(root);
  }
}
