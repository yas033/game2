export class ResultsScreenView {
  constructor(
    container: string | HTMLElement,
    score: number,
    hearts: number,
    onBack: () => void
  ) {
    const root = typeof container === "string"
      ? document.getElementById(container)!
      : container;

    root.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:Inter,Arial;color:#fff;background:#0b1220;">
        <h1 style="font-size:32px;margin-bottom:20px;">Results</h1>
        <p style="font-size:22px;">Final Score: <b>${score}</b></p>
        <p style="font-size:22px;margin-bottom:30px;">Hearts: <b>${hearts}</b></p>
        <button id="homeBtn" style="padding:10px 24px;font-size:18px;border:none;border-radius:8px;background:#2dd4bf;color:#0b1220;cursor:pointer;">Home</button>
      </div>
    `;
    root.querySelector<HTMLButtonElement>("#homeBtn")!.addEventListener("click", onBack);
  }
}
