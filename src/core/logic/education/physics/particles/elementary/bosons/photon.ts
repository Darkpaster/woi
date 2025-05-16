import { Boson } from './boson.ts';
import {Vector2D} from "../../../../../../../utils/math/2d.ts";

export class Photon extends Boson {
    private frequency: number;
    private wavelength: number;
    private amplitude: number;
    private phase: number;

    constructor(position: Vector2D, wavelength: number = 10) {
        // Параметры фотона: масса, заряд, спин, дальность, время жизни
        super(position, 'electromagnetic', 0, 0, 1, Infinity, Infinity);

        this.color = { r: 255, g: 255, b: 100 };
        this.radius = 2;
        this._name = 'γ';

        // Фотоны движутся со скоростью света (в нашей симуляции это будет просто быстро)
        const speed = 150;
        const angle = Math.random() * Math.PI * 2;

        this.velocity = new Vector2D(Math.cos(angle) * speed,Math.sin(angle) * speed)

        // Параметры волны фотона
        this.wavelength = wavelength;
        this.frequency = 1 / wavelength;
        this.amplitude = 5;
        this.phase = 0;
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // const c = 299792458; // скорость света в м/с
        // const scaleFactor = 0.1; // масштабный коэффициент для симуляции

        // Обновляем фазу волны
        this.phase += deltaTime * 10;
        if (this.phase > Math.PI * 2) {
            this.phase -= Math.PI * 2;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const direction = Math.atan2(this.velocity.y, this.velocity.x);
        const perpDirection = direction + Math.PI / 2;

        // Рисуем волну вдоль направления движения
        const waveLength = 40; // Длина отрисовки волны
        const segments = 20;

        ctx.beginPath();

        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * waveLength;
            const distance = -waveLength/2 + t;

            const x = this.position.x + Math.cos(direction) * distance;
            const y = this.position.y + Math.sin(direction) * distance;

            // Электрическая компонента (вертикальная волна)
            const electricOffset = Math.sin(
                (2 * Math.PI * distance / this.wavelength) + this.phase
            ) * this.amplitude;

            const electricX = x + Math.cos(perpDirection) * electricOffset;
            const electricY = y + Math.sin(perpDirection) * electricOffset;

            if (i === 0) {
                ctx.moveTo(electricX, electricY);
            } else {
                ctx.lineTo(electricX, electricY);
            }
        }

        ctx.strokeStyle = `rgba(255, 255, 0, 0.7)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Магнитная компонента (горизонтальная волна, со сдвигом фазы)
        ctx.beginPath();

        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * waveLength;
            const distance = -waveLength/2 + t;

            const x = this.position.x + Math.cos(direction) * distance;
            const y = this.position.y + Math.sin(direction) * distance;

            // Магнитная компонента (перпендикулярна электрической)
            const magneticOffset = Math.sin(
                (2 * Math.PI * distance / this.wavelength) + this.phase + Math.PI/2
            ) * this.amplitude;

            const magneticX = x + Math.cos(perpDirection + Math.PI/2) * magneticOffset;
            const magneticY = y + Math.sin(perpDirection + Math.PI/2) * magneticOffset;

            if (i === 0) {
                ctx.moveTo(magneticX, magneticY);
            } else {
                ctx.lineTo(magneticX, magneticY);
            }
        }

        ctx.strokeStyle = `rgba(0, 200, 255, 0.7)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Рисуем маленькую точку в центре
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
        ctx.fill();
    }

    getFrequency(): number {
        return this.frequency;
    }

    getWavelength(): number {
        return this.wavelength;
    }

    // Фотоны сами являются своими античастицами
    createAntiParticle(): Boson {
        return new Photon(this.position, this.wavelength);
    }
}