import { settings } from "../config/settings.ts";
import { randomInt, scaledTileSize } from "../../utils/math.ts";
import { TimeDelay } from "../../utils/time.ts";

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
    private text: string | number;
    private lifeTime: TimeDelay;
    private readonly fillStyle: string;
    private readonly crit: boolean;

    constructor({ text, x, y, color, crit }: FloatTextProps) {
        if (crit) {
            this.x = randomInt(x - scaledTileSize() * 1, x + scaledTileSize() * 1);
            this.y = randomInt(y - scaledTileSize() * 3, y);
        } else {
            this.x = randomInt(x, x + scaledTileSize());
            this.y = randomInt(y - scaledTileSize(), y);
        }
        this.text = text;
        this.lifeTime = new TimeDelay(1500);
        this.fillStyle = color;
        this.crit = crit;  
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.fillStyle;

        if (this.crit) {
            ctx.font = `${7 * settings.defaultTileScale * 2}px pixel`;
        }
        
        ctx.fillText(this.text.toString(), this.x, this.y);

        ctx.font = `${7 * settings.defaultTileScale * 1}px pixel`;
    }

    update(): boolean {
        this.y--;
        return !!this.lifeTime.timeIsUp();
    }
}