export class Delay {
    frameCounter: number;
    iterations: number;

    constructor(iterations: number) {
        this.frameCounter = 0;
        this.iterations = iterations;
    }

    timeIsUp(): boolean {
        if (this.frameCounter > this.iterations) {
            this.frameCounter = 0;
        }
        return ++this.frameCounter >= this.iterations;
    }
}

export class TimeDelay {
    delayTime: number;
    startTime: number | null;
    atStartNoDelay: boolean;

    constructor(delayTime: number, atStartNoDelay: boolean = false) {
        this.delayTime = delayTime;
        this.startTime = null;
        this.atStartNoDelay = atStartNoDelay;
    }

    timeIsUp(): boolean | undefined {
        if (this.startTime === null) {
            this.startTime = Date.now();
            if (this.atStartNoDelay) {
                return true;
            }
        }
        if (Date.now() - this.startTime > this.delayTime) {
            this.startTime = null;
            if (!this.atStartNoDelay) {
                return true;
            }
        }
    }

    setDelay(delayTime: number): void {
        this.delayTime = delayTime;
    }

    reset(): void {
        this.startTime = null;
    }

    getLeftTime(): number | undefined {
        return this.delayTime - (Date.now() - (this.startTime || 0));
    }

    getLeftTimePercent(): number | undefined {
        return (this.delayTime - (Date.now() - (this.startTime || 0))) / this.delayTime;
    }
}

export class CallbackTimer {
    callback: () => void;
    delay: number;
    id: NodeJS.Timeout | null;
    cooldown: { id?: any; done?: boolean; restart?: () => void } | null;
    done: boolean;
    startTime: number;

    constructor(callback: () => void = () => { console.log("default") }, delay: number = 1000, cooldown:
        { id?: any; done?: boolean; restart?: () => void } | null = null) {
        this.callback = callback;
        this.delay = delay;
        this.id = null;
        this.cooldown = cooldown;
        this.done = false;
        this.startTime = 0;
    }

    start(initCallback?: (() => void)): void {
        if (this.cooldown?.id && !this.cooldown.done) {
            return;
        }

        this.done = false;
        this.startTime = Date.now();

        this.id = setTimeout(() => {
            this.callback();
            this.done = true;
            this.stop();
        },
            this.delay);

        if (this.cooldown && this.cooldown.restart) {
            this.cooldown.restart();
        }
    }

    setCallback(callback: () => void): void {
        this.callback = callback;
    }

    setDelay(delay: number): void {
        this.delay = delay;
    }

    stop(): void {
        clearTimeout(this.id || 0);
        this.id = null;
    }

    restart(): void {
        this.stop();
        this.start();
    }

    getLeftTime(): number {
        return (this.delay - (Date.now() - this.startTime));
    }

    getLeftTimePercent(): number {
        return (this.delay - (Date.now() - this.startTime)) / this.delay;
    }
}