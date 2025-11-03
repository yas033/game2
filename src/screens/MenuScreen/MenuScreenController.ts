import { WordsDropGameController } from "../WordsDropGame/WordsDropGameController";

// 可选：点击音效（若 public/sounds/click.wav 存在就会播放）
function loadClick() {
  try {
    const a = new Audio("/sounds/click.wav"); // Vite: public/sounds/click.wav
    a.load();
    return a;
  } catch {
    return undefined;
  }
}

export class MenuScreenController {
  constructor(private root: HTMLDivElement) {
    this.root.innerHTML = `
      <div style="text-align:center; font-family:sans-serif; padding-top:100px">
        <h1>WordBlock</h1>
        <p>Use ← → to move, Space/↓ to drop</p>
        <button id="startBtn" style="padding:10px 18px; font-size:16px">Start Game</button>
      </div>
    `;

    const clickSound = loadClick();

    document.getElementById("startBtn")?.addEventListener("click", () => {
      clickSound?.play().catch(() => {});
      // 切到游戏画面
      this.root.innerHTML = "";
      setTimeout(() => {
        new WordsDropGameController(this.root); // this.root 类型为 HTMLDivElement，匹配构造函数
      }, 200);
    });
  }
}

