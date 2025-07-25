import { settings } from "../config/settings.ts";
import { TimeDelay } from "../../../utils/general/time.ts";
import {scaledTileSize} from "../../../utils/math/general.ts";
import {randomInt} from "../../../utils/math/random.ts";

interface FloatTextProps {
    text: string | number;
    x: number;
    y: number;
    color: string;
    crit: boolean;
}

export class FloatText {
    private readonly x: number;
    private y: number;
    private readonly text: string | number;
    private readonly lifeTime: TimeDelay;
    private floatingSpeed: TimeDelay = new TimeDelay(50);
    private readonly moveUnit = window.innerHeight / 250;
    private readonly fillStyle: string;
    private readonly crit: boolean;

    constructor({ text, x, y, color, crit }: FloatTextProps) {
        if (crit) {
            this.x = randomInt(x - scaledTileSize() / 2, x + scaledTileSize() / 2);
            this.y = randomInt(y - scaledTileSize() * 2, y);
        } else {
            // this.x = randomInt(x - scaledTileSize() * 1, x + scaledTileSize() * 1);
            // this.y = randomInt(y - scaledTileSize(), y);
            this.x = x;
            this.y = randomInt(y - scaledTileSize() * 1, y);
        }
        this.text = text;
        this.lifeTime = new TimeDelay(1500);
        this.fillStyle = color;
        this.crit = crit;  
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.fillStyle;

        if (this.crit) {
            ctx.font = `${7 * settings.defaultTileScale * 2}px PixelFont`;
        }
        ctx.fillText(this.text.toString(), this.x, this.y);
        ctx.font = `${7 * settings.defaultTileScale * 1}px PixelFont`;
    }

    update(): boolean {
        if (this.floatingSpeed.timeIsUp()) {
            this.y -= this.moveUnit;
        }
        return !!this.lifeTime.timeIsUp();
    }
}