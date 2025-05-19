import {Point} from "../../../../../../utils/math/2d.ts";
import {SimulationObject} from "../simulations/simulation.ts";
import { Cell } from "./cell.ts";

export enum CellOrganelle {
    NUCLEUS,
    MITOCHONDRIA,
    CHLOROPLAST,
    ENDOPLASMIC_RETICULUM,
    GOLGI_APPARATUS,
    LYSOSOME,
    VACUOLE,
    CELL_MEMBRANE,
    CELL_WALL,
    RIBOSOME,
    CYTOSKELETON
}

export class Organelle implements SimulationObject {
    public id: string;
    private type: CellOrganelle;
    private position: Point;
    private size: number;
    private color: string;
    private activity: number = 0.5; // 0 = inactive, 1 = fully active
    private parent: Cell;

    constructor(
        id: string,
        type: CellOrganelle,
        position: Point,
        size: number,
        parent: Cell
    ) {
        this.id = id;
        this.type = type;
        this.position = position;
        this.size = size;
        this.parent = parent;

        // Set color based on organelle type
        switch (type) {
            case CellOrganelle.NUCLEUS: this.color = '#8A2BE2'; break;  // BlueViolet
            case CellOrganelle.MITOCHONDRIA: this.color = '#FF4500'; break; // OrangeRed
            case CellOrganelle.CHLOROPLAST: this.color = '#32CD32'; break; // LimeGreen
            case CellOrganelle.ENDOPLASMIC_RETICULUM: this.color = '#00BFFF'; break; // DeepSkyBlue
            case CellOrganelle.GOLGI_APPARATUS: this.color = '#FFD700'; break; // Gold
            case CellOrganelle.LYSOSOME: this.color = '#FF69B4'; break; // HotPink
            case CellOrganelle.VACUOLE: this.color = '#87CEEB'; break; // SkyBlue
            case CellOrganelle.CELL_MEMBRANE: this.color = '#F08080'; break; // LightCoral
            case CellOrganelle.CELL_WALL: this.color = '#A0522D'; break; // Sienna
            case CellOrganelle.RIBOSOME: this.color = '#6A5ACD'; break; // SlateBlue
            case CellOrganelle.CYTOSKELETON: this.color = '#696969'; break; // DimGray
        }
    }

    public update(deltaTime: number): void {
        // Add slight movement to simulate activity inside the cell
        const movementRadius = 1.0;
        const parentPos = this.parent.getPosition();
        const parentRadius = this.parent.getSize();

        // Calculate relative position from cell center
        const relativeX = this.position.x - parentPos.x;
        const relativeY = this.position.y - parentPos.y;

        // Calculate distance from center
        const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);

        // Ensure organelle stays inside cell
        const maxDistance = parentRadius - this.size;
        if (distance > maxDistance) {
            // Move organelle back inside cell
            const angle = Math.atan2(relativeY, relativeX);
            const adjustedX = Math.cos(angle) * maxDistance;
            const adjustedY = Math.sin(angle) * maxDistance;

            this.position = new Point(
                parentPos.x + adjustedX,
                parentPos.y + adjustedY
            );
        } else {
            // Random movement within cell
            this.position = new Point(
                this.position.x + (Math.random() - 0.5) * movementRadius * deltaTime,
                this.position.y + (Math.random() - 0.5) * movementRadius * deltaTime
            );
        }

        // Random fluctuation in activity
        this.activity += (Math.random() - 0.5) * 0.1 * deltaTime;
        if (this.activity < 0.1) this.activity = 0.1;
        if (this.activity > 1.0) this.activity = 1.0;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Render different organelles differently
        switch (this.type) {
            case CellOrganelle.NUCLEUS:
                this.renderNucleus(ctx);
                break;
            case CellOrganelle.MITOCHONDRIA:
                this.renderMitochondria(ctx);
                break;
            case CellOrganelle.CHLOROPLAST:
                this.renderChloroplast(ctx);
                break;
            case CellOrganelle.ENDOPLASMIC_RETICULUM:
                this.renderER(ctx);
                break;
            case CellOrganelle.GOLGI_APPARATUS:
                this.renderGolgi(ctx);
                break;
            default:
                // Default rendering for other organelles
                ctx.fillStyle = this.color;
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
                break;
        }
    }

    private renderNucleus(ctx: CanvasRenderingContext2D): void {
        // Main nucleus
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Nuclear envelope (double membrane)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size - 2, 0, Math.PI * 2);
        ctx.stroke();

        // Nucleolus
        ctx.fillStyle = '#4B0082'; // Indigo
        ctx.beginPath();
        ctx.arc(
            this.position.x + this.size * 0.3,
            this.position.y - this.size * 0.2,
            this.size * 0.3,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Nuclear pores
        const numPores = 8;
        for (let i = 0; i < numPores; i++) {
            const angle = (i / numPores) * Math.PI * 2;
            const x = this.position.x + Math.cos(angle) * this.size;
            const y = this.position.y + Math.sin(angle) * this.size;

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1.0;
    }

    private renderMitochondria(ctx: CanvasRenderingContext2D): void {
        const width = this.size * 2;
        const height = this.size;

        // Main body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(
            this.position.x,
            this.position.y,
            width,
            height,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Outer membrane
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(
            this.position.x,
            this.position.y,
            width,
            height,
            0,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        // Inner folded membrane (cristae)
        ctx.strokeStyle = '#CC3300';
        ctx.lineWidth = 1;

        // Horizontal cristae
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(this.position.x - width * 0.8, this.position.y + i * (height * 0.3));

            // Wavy line for cristae
            for (let x = -width * 0.8; x <= width * 0.8; x += 5) {
                const xPos = this.position.x + x;
                const yOffset = Math.sin(x * 0.1) * 2;
                const yPos = this.position.y + i * (height * 0.3) + yOffset;

                ctx.lineTo(xPos, yPos);
            }

            ctx.stroke();
        }
    }

    private renderChloroplast(ctx: CanvasRenderingContext2D): void {
        const width = this.size * 2;
        const height = this.size;

        // Main body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(
            this.position.x,
            this.position.y,
            width,
            height,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Outer membrane
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(
            this.position.x,
            this.position.y,
            width,
            height,
            0,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        // Thylakoid stacks (grana)
        ctx.fillStyle = '#009900';
        const numStacks = 5;
        const stackWidth = width * 0.25;
        const stackHeight = height * 0.3;

        for (let i = 0; i < numStacks; i++) {
            const xOffset = (i - numStacks / 2) * (width * 0.3);

            // Stack of thylakoids
            for (let j = 0; j < 3; j++) {
                ctx.beginPath();
                ctx.ellipse(
                    this.position.x + xOffset,
                    this.position.y - stackHeight / 2 + j * (stackHeight * 0.4),
                    stackWidth,
                    stackHeight * 0.25,
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
    }

    private renderER(ctx: CanvasRenderingContext2D): void {
        // Endoplasmic Reticulum network
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;

        const startX = this.position.x - this.size;
        const startY = this.position.y;

        // Draw a series of curved lines to represent ER
        for (let i = 0; i < 5; i++) {
            const yOffset = i * (this.size * 0.4);

            ctx.beginPath();
            ctx.moveTo(startX, startY + yOffset);

            // Create a wavy line
            for (let x = 0; x <= this.size * 4; x += 5) {
                const xPos = startX + x;
                const yPos = startY + yOffset + Math.sin(x * 0.1) * 5;

                ctx.lineTo(xPos, yPos);
            }

            ctx.stroke();

            // Add ribosomes for rough ER
            if (i % 2 === 0) {
                ctx.fillStyle = '#6A5ACD'; // SlateBlue for ribosomes
                for (let x = 0; x <= this.size * 4; x += 10) {
                    const xPos = startX + x;
                    const yPos = startY + yOffset + Math.sin(x * 0.1) * 5;

                    ctx.beginPath();
                    ctx.arc(xPos, yPos + 3, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    private renderGolgi(ctx: CanvasRenderingContext2D): void {
        // Golgi apparatus stacked cisternae
        ctx.fillStyle = this.color;

        const numLayers = 5;
        const layerWidth = this.size * 2;
        const layerHeight = this.size * 0.3;

        for (let i = 0; i < numLayers; i++) {
            // Each cisterna slightly offset
            const curveOffset = Math.sin(i * 0.5) * 5;

            ctx.beginPath();
            ctx.ellipse(
                this.position.x + curveOffset,
                this.position.y + i * layerHeight,
                layerWidth - i * 5, // Cisternae get smaller
                layerHeight * 0.6,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Outline
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        // Vesicles budding off
        ctx.fillStyle = this.color;
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI;
            const radius = 5;
            const xOffset = Math.cos(angle) * layerWidth;
            const yOffset = Math.sin(angle) * layerHeight * numLayers * 0.5;

            ctx.beginPath();
            ctx.arc(
                this.position.x + xOffset,
                this.position.y + yOffset,
                radius,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }

    public getType(): CellOrganelle {
        return this.type;
    }

    public getActivity(): number {
        return this.activity;
    }

    public setActivity(activity: number): void {
        this.activity = Math.max(0, Math.min(1, activity));
    }

    public getPosition(): Point {
        return this.position;
    }
}