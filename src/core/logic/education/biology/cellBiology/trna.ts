import { Position, SimulationObject } from '../core';

export enum TRNAState {
    FREE = 'free',
    CHARGED = 'charged',
    BOUND = 'bound',
    RELEASED = 'released'
}

export class TRNA implements SimulationObject {
    private id: string;
    private position: Position;
    private size: number = 8;
    private color: string = '#66CDAA'; // Medium Aquamarine
    private anticodon: string;
    private aminoAcid: string | null = null;
    private state: TRNAState = TRNAState.FREE;
    private targetPosition: Position | null = null;
    private movementSpeed: number = 30; // units per second
    private boundRibosome: any = null; // Reference to bound ribosome

    constructor(id: string, position: Position, anticodon: string) {
        this.id = id;
        this.position = position;
        this.anticodon = anticodon;
    }

    public update(deltaTime: number): void {
        // Movement toward target if there is one
        if (this.targetPosition) {
            const dx = this.targetPosition.x - this.position.x;
            const dy = this.targetPosition.y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 1) {
                // Reached target
                this.position = new Position(this.targetPosition.x, this.targetPosition.y);
                this.targetPosition = null;
            } else {
                // Move toward target
                const moveDistance = Math.min(distance, this.movementSpeed * deltaTime);
                const ratio = moveDistance / distance;
                this.position = new Position(
                    this.position.x + dx * ratio,
                    this.position.y + dy * ratio
                );
            }
        } else {
            // Random movement when free
            if (this.state === TRNAState.FREE || this.state === TRNAState.CHARGED) {
                const randomMove = 1.5;
                this.position = new Position(
                    this.position.x + (Math.random() - 0.5) * randomMove * deltaTime,
                    this.position.y + (Math.random() - 0.5) * randomMove * deltaTime
                );
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();

        // Draw based on state
        switch (this.state) {
            case TRNAState.FREE:
                // Draw L-shape for free tRNA
                this.drawLShape(ctx, this.color);
                break;
            case TRNAState.CHARGED:
                // Draw L-shape with amino acid
                this.drawLShape(ctx, '#20B2AA'); // Light Sea Green
                this.drawAminoAcid(ctx);
                break;
            case TRNAState.BOUND:
                // Draw L-shape with amino acid at ribosome
                this.drawLShape(ctx, '#48D1CC'); // Medium Turquoise
                this.drawAminoAcid(ctx);
                break;
            case TRNAState.RELEASED:
                // Draw L-shape without amino acid
                this.drawLShape(ctx, '#B0C4DE'); // Light Steel Blue
                break;
        }
    }

    private drawLShape(ctx: CanvasRenderingContext2D, color: string): void {
        // Draw tRNA as an L-shape
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x, y);
        ctx.lineTo(x + size, y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();

        // Draw anticodon region
        ctx.beginPath();
        ctx.arc(x + size, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Draw text for anticodon
        ctx.font = '6px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText(this.anticodon, x + size - 8, y + 8);
    }

    private drawAminoAcid(ctx: CanvasRenderingContext2D): void {
        if (!this.aminoAcid) return;

        // Draw amino acid at top of tRNA
        const x = this.position.x;
        const y = this.position.y - this.size;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FF69B4'; // Hot Pink
        ctx.fill();

        // Draw amino acid letter
        ctx.font = '6px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText(this.aminoAcid, x - 2, y + 2);
    }

    public charge(aminoAcid: string): void {
        this.aminoAcid = aminoAcid;
        this.state = TRNAState.CHARGED;
    }

    public discharge(): string | null {
        const aa = this.aminoAcid;
        this.aminoAcid = null;
        this.state = TRNAState.RELEASED;
        return aa;
    }

    public matches(codon: string): boolean {
        // Check if this tRNA's anticodon matches the given codon
        // This is a simplified implementation - in reality, wobble base pairing allows
        // some flexibility in the third position

        // Convert codon to DNA complement then to RNA
        let dnaComplement = '';
        for (let i = 0; i < codon.length; i++) {
            switch (codon[i]) {
                case 'A': dnaComplement += 'U'; break;
                case 'U': dnaComplement += 'A'; break;
                case 'G': dnaComplement += 'C'; break;
                case 'C': dnaComplement += 'G'; break;
                default: dnaComplement += 'N';
            }
        }

        return this.anticodon === dnaComplement;
    }

    public bindToRibosome(ribosome: any, targetPos: Position): void {
        this.boundRibosome = ribosome;
        this.state = TRNAState.BOUND;
        this.targetPosition = targetPos;
    }

    public releaseFromRibosome(): void {
        this.boundRibosome = null;
        this.state = TRNAState.RELEASED;
        this.targetPosition = null;
    }

    public getPosition(): Position {
        return this.position;
    }

    public getState(): TRNAState {
        return this.state;
    }

    public getAnticodon(): string {
        return this.anticodon;
    }

    public getAminoAcid(): string | null {
        return this.aminoAcid;
    }

    public getId(): string {
        return this.id;
    }
}