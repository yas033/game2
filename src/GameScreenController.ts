import { GameScreenModel } from "./GameScreenModel";
import { GameScreenView } from "./GameScreenView";
import { ResultsScreenController } from "./ResultsScreenController";

const POINTS_PER_HEART = 5;

type SoundSet = {
  correct?: HTMLAudioElement;
  wrong?: HTMLAudioElement;
  click?: HTMLAudioElement;
  beep?: HTMLAudioElement;
};

// Tries both "/sounds/..." (Vite public) and "/src/public/sounds/..." (your plan)
function loadSound(name: string): HTMLAudioElement | undefined {
  const candidates = [
    `/sounds/${name}`,
    `/src/public/sounds/${name}`,
  ];
  for (const p of candidates) {
    const a = new Audio(p);
    try { a.load(); } catch {}
    return a; // first candidate is fine; browser will fetch when played
  }
  return undefined;
}

export class GameScreenController {
  model: GameScreenModel;
  view: GameScreenView;
  sounds: SoundSet;

  private tickTimer?: number;

  constructor(container: string | HTMLDivElement) {
    this.model = new GameScreenModel(90);
    this.view = new GameScreenView(container, this.model);
    this.sounds = {
      correct: loadSound("correct.ogg"),
      wrong:   loadSound("wrong.ogg"),
      click:   loadSound("click.wav"),
      beep:    loadSound("beep.ogg"),
    };

    this.bindKeys();
    this.countdownThenStart(); // 3-2-1 with beep.ogg
  }

  private bindKeys() {
    window.addEventListener("keydown", (e) => {
      if (!this.model.running) return;

      switch (e.key) {
        case "ArrowLeft":
        case "a":
          this.model.move(-1);
          if (this.model.current) this.view.renderPreview(this.model.current);
          this.sounds.click?.play().catch(() => {});
          break;
        case "ArrowRight":
        case "d":
          this.model.move(1);
          if (this.model.current) this.view.renderPreview(this.model.current);
          this.sounds.click?.play().catch(() => {});
          break;
        case " ":
        case "ArrowDown":
          e.preventDefault();
          this.sounds.click?.play().catch(() => {});
          this.drop();
          break;
      }
    });
  }

  // --- Flow: 3-2-1 beep → start loop ---
  private async countdownThenStart() {
    this.model.running = false;
    this.view.updateHUD(this.model.score, this.model.hearts, this.model.timeLeft);

    for (let n = 3; n >= 1; n--) {
      this.view.showOverlay(`${n}`, true);
      this.sounds.beep?.play().catch(() => {});
      await this.sleep(900);
    }
    this.view.showOverlay("", false);

    // Spawn first block
    const spawned = this.model.spawn();
    if (!spawned) return this.end("Stack Overflow");
    this.view.renderPreview(spawned);

    this.model.running = true;

    // second-wise game timer
    this.tickTimer = window.setInterval(() => {
      if (!this.model.running) return;
      this.model.timeLeft--;
      this.view.updateHUD(this.model.score, this.model.hearts, this.model.timeLeft);
      if (this.model.timeLeft <= 0) this.end("Time Up");
    }, 1000);
  }

  private drop() {
    const res = this.model.hardDrop();
    if (res.overflow) {
      this.end("Stack Overflow");
      return;
    }

    // re-render grid
    this.view.renderGrid(this.model.grid);

    if (res.cleared > 0) {
      this.model.score += res.cleared;             // +1 per clear
      if (this.model.score > 0 && this.model.score % POINTS_PER_HEART === 0) {
        this.model.hearts += 1;                    // +1 heart per 5 points
      }
      this.sounds.correct?.play().catch(() => {});
    }

    this.view.updateHUD(this.model.score, this.model.hearts, this.model.timeLeft);

    // spawn next
    const spawned = this.model.spawn();
    if (!spawned) {
      this.end("Stack Overflow");
      return;
    }
    this.view.renderPreview(spawned);
  }

  private end(reason: string) {
    this.model.running = false;
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.view.showOverlay(`Game Over — ${reason}\nScore ${this.model.score}  •  Hearts ${this.model.hearts}`, true);
    this.sounds.wrong?.play().catch(() => {});
    setTimeout(() => {
      const root = (typeof document !== "undefined" && (document.getElementById("container") as HTMLElement)) || document.body;
      root.innerHTML = "";
      new ResultsScreenController(root, this.model.score, this.model.hearts);
    }, 2000);
  }

  private sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }
}
