import {DEFAULT_VISUALIZATION_OPTIONS, VisualizationOptions} from "../../../../../../utils/math/graphics.ts";


export abstract class Visualizer {
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;
    protected options: VisualizationOptions;

    constructor(canvasId: string, options: Partial<VisualizationOptions> = {}) {
        const canvas = document.getElementById(canvasId);
        this.canvas = canvas;
        this.options = { ...DEFAULT_VISUALIZATION_OPTIONS, ...options };

        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2D context from canvas');
        }

        this.ctx = ctx;
        this.resizeCanvas();
    }

    protected resizeCanvas(): void {
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
    }

    protected clearCanvas(): void {
        this.ctx.fillStyle = this.options.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    protected drawText(text: string, x: number, y: number, color: string = this.options.foregroundColor): void {
        this.ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }

    protected drawLine(x1: number, y1: number, x2: number, y2: number,
                       color: string = this.options.foregroundColor, lineWidth: number = 1): void {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
    }

    protected drawCircle(x: number, y: number, radius: number,
                         color: string = this.options.foregroundColor, fill: boolean = true): void {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);

        if (fill) {
            this.ctx.fillStyle = color;
            this.ctx.fill();
        } else {
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
        }
    }

    protected drawRectangle(x: number, y: number, width: number, height: number,
                            color: string = this.options.foregroundColor, fill: boolean = true): void {
        if (fill) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, width, height);
        } else {
            this.ctx.strokeStyle = color;
            this.ctx.strokeRect(x, y, width, height);
        }
    }

    public abstract render(): void;
    public abstract update(data: any): void;
}