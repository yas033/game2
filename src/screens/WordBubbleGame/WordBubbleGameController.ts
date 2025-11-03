import { WordBubbleGameView, Bubble, Category } from "./WordBubbleGameView";
import { wordBank } from "../../data/wordBank";

    // simple word pools can be replace by future word bank
    const NOUNS = ["cat","tree","river","cloud","lemon","desk","book","music","stone","car","city","phone","leaf","cookie","planet"];
    const VERBS = ["run","jump","read","code","sing","draw","spin","bake","swim","play","drive","climb","laugh","dance","learn"];
    const ADJS  = ["red","fast","soft","loud","bright","sweet","round","cold","brave","clean","funny","happy","blue","green","tiny"];

    function pick<T>(arr: T[], k = 1): T[] {
    const a = [...arr];
    const out: T[] = [];
    while (out.length < k && a.length) {
        const i = Math.floor(Math.random() * a.length);
        out.push(a.splice(i, 1)[0]);
    }
    return out;
    }

    function loadSound(name: string): HTMLAudioElement | undefined {
    const paths = [`/sounds/${name}`, `/src/public/sounds/${name}`];
    for (const p of paths) {
        const a = new Audio(p);
        try { a.load(); } catch {}
        return a;
    }
    return undefined;
    }

    export class WordBubbleGameController {
    private view: WordBubbleGameView;
    // current target category
    private target: Category = "noun";
    private running = false;
    private timeLeft = 15;
    private score = 0;
    private hearts = 0;

    private ticker?: number;
    private sounds = {
        beep: loadSound("beep.ogg"),
        correct: loadSound("correct.ogg"),
        wrong: loadSound("wrong.ogg"),
    };

    //  “Back” button（index）
    constructor(container: string | HTMLDivElement) {
        this.view = new WordBubbleGameView(container);
        this.view.onBack(() => (window.location.href = "/index.html"));
        // intro screens
        this.showIntro();
    }

    // instruction screens
    private async showIntro() {
        this.view.showOverlay(
        "Word Bubble Game",
        'Only click the right category.\nReady?',
        true
        );
        // 1.5s fallback + 3-2-1 countdown + 5s 
        await this.sleep(1500);
        await this.countdown321(); // 3-2-1 beep.ogg file
        await this.showFindTargetSlide(); // 5s instructions
        this.startGame();
    }

    private async countdown321() {
        this.view.showOverlay("3", "", true);  this.sounds.beep?.play().catch(()=>{});
        await this.sleep(900);
        this.view.showOverlay("2", "", true);  this.sounds.beep?.play().catch(()=>{});
        await this.sleep(900);
        this.view.showOverlay("1", "", true);  this.sounds.beep?.play().catch(()=>{});
        await this.sleep(900);
        this.view.showOverlay("", "", false);
    }

    private async showFindTargetSlide() {
        this.target = (["noun","verb","adj"] as Category[])[Math.floor(Math.random()*3)];
        const msg = `Find all the ${this.target === "adj" ? "adjectives" : this.target + "s"}!`;
        this.view.showOverlay("Go!", msg, true);
        await this.sleep(1200);
        this.view.showOverlay("", "", false);
    }

    private startGame() {
        this.running = true;
        this.timeLeft = 15;
        this.score = 0;
        // first 5 bubbles
        this.renderNewRound();

        // timer
        this.ticker = window.setInterval(() => {
            if (!this.running) return;
            this.timeLeft--;
            this.view.updateHUD(this.score, this.hearts, this.timeLeft);
            if (this.timeLeft <= 0) this.endGame("Time Up");
            }, 3000);
        }

    private endGame(reason: string) {
    this.running = false;
    if (this.ticker) clearInterval(this.ticker);

    // transparent overlay with reason & 2 buttons
    this.view.showOverlay(`Game Over — ${reason}\nScore ${this.score} • Hearts ${this.hearts}`,
                        "Try again or Back to Mini Game Page", true);

    // use dom to add buttons
    const dom = this.view["stage"].container() as HTMLDivElement;
    const panel = document.createElement("div");
    panel.style.position = "absolute";
    panel.style.left = "50%";
    panel.style.top = "68%";
    panel.style.transform = "translate(-50%,-50%)";
    panel.style.display = "flex";
    panel.style.gap = "12px";

    const again = document.createElement("button");
    again.textContent = "Try it again";
    again.onclick = () => { window.location.reload() };
    const back = document.createElement("button");
    back.textContent = "Back to Mini Game Page";
    back.onclick = () => (window.location.href = "/index.html");

    //  style buttons
    for (const b of [again, back]) {
        b.style.padding = "10px 14px";
        b.style.borderRadius = "10px";
        b.style.border = "none";
        b.style.fontWeight = "600";
        }
        panel.append(again, back);
        dom.append(panel);
    }

    // each round：generate 5 bubbles & make sure has at least 2 correct ones
    private renderNewRound() {
        const correctPool = this.poolFor(this.target);
        const wrongPool   = this.poolFor(this.randomOther(this.target));

        const correctWords = pick(correctPool, 2 + Math.floor(Math.random()*2)); // 2 or 3 correct
        const needed = 5 - correctWords.length;
        const wrongWords = pick(wrongPool, needed);

        // to shuffle
        const words = [
        ...correctWords.map(w => ({ word: w, cat: this.target as Category })),
        ...wrongWords.map(w => ({ word: w, cat: this.randomOther(this.target) as Category })),
        ];

        // 24 slop pick 5 each time (each bubble at least >=10px away from others)
        const slots = this.pickSlots(5);
        const bubbles: Bubble[] = words.map((w, i) => ({
        id: crypto.randomUUID(),
        word: w.word,
        cat: w.cat,
        slot: slots[i],
        }));

        this.view.renderBubbles(bubbles, (id) => this.handleClick(bubbles, id));
        this.view.updateHUD(this.score, this.hearts, this.timeLeft);
    }

    // to handle bubble click
    private handleClick(bubbles: Bubble[], id: string) {
        if (!this.running) return;
        const b = bubbles.find(x => x.id === id);
        if (!b) return;

        if (b.cat === this.target) {
        this.score += 1;
        if (this.score > 0 && this.score % 10 === 0) this.hearts += 1;
        this.sounds.correct?.play().catch(()=>{});
        } else {
        this.score = Math.max(0, this.score - 1);
        this.sounds.wrong?.play().catch(()=>{});
        if (this.score === 0) return this.endGame("Score reached 0");
        }
        // render new round after each click
        this.renderNewRound();
    }

    // --------------tools for controller---------------
    private poolFor(cat: Category): string[] {
        return wordBank[cat];
    }

    // pick a random category other than the given one
    private randomOther(cat: Category): Category {
        const arr: Category[] = ["noun","verb","adj"].filter(c => c !== cat) as Category[];
        return arr[Math.floor(Math.random()*arr.length)];
    }

    // pick k slots from 24 slots (0..23)
    private pickSlots(k: number): number[] {
        const all = Array.from({ length: 24 }, (_, i) => i);
        return pick(all, k);
    }

    private sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
    }
