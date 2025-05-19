enum ParticleType {
    ELECTRON = "ELECTRON",
    PROTON = "PROTON"
}

interface ParticleProperties {
    charge: number;
    color: string;
    radius: number;
}

const PARTICLE_TYPES: Record<ParticleType, ParticleProperties> = {
    [ParticleType.ELECTRON]: {
        charge: -1,
        color: "#4287f5",
        radius: 3
    },
    [ParticleType.PROTON]: {
        charge: 1,
        color: "#f54242",
        radius: 5
    }
};

class Particle {
    type: ParticleType;
    x: number;
    y: number;
    vx: number;
    vy: number;

    constructor(type: ParticleType, x: number, y: number, vx: number, vy: number) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
    }

    getCharge(): number {
        return PARTICLE_TYPES[this.type].charge;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const properties = PARTICLE_TYPES[this.type];
        ctx.fillStyle = properties.color;
        const radius = properties.radius;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class SimpleParticleSimulation {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private particles: Particle[] = [];
    private animationFrameId: number | null = null;
    private lastTimestamp: number = 0;

    private readonly WIDTH: number;
    private readonly HEIGHT: number;
    private readonly PARTICLE_COUNT: number = 100;
    private readonly FPS: number = 60;
    private readonly FRAME_DURATION: number = 1000 / this.FPS;

    constructor(canvasId: string, width: number = 800, height: number = 600, particleCount?: number) {
        this.WIDTH = width;
        this.HEIGHT = height;

        if (particleCount !== undefined) {
            this.PARTICLE_COUNT = particleCount;
        }

        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error(`Canvas element with id "${canvasId}" not found.`);
        }

        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;

        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Failed to get canvas 2D context.');
        }
        this.ctx = context;

        this.initializeParticles();
    }

    private initializeParticles(): void {
        for (let i = 0; i < this.PARTICLE_COUNT; i++) {
            const type = Math.random() < 0.5 ? ParticleType.ELECTRON : ParticleType.PROTON;
            const x = Math.random() * this.WIDTH;
            const y = Math.random() * this.HEIGHT;
            const vx = (Math.random() - 0.5) * 2;
            const vy = (Math.random() - 0.5) * 2;
            this.particles.push(new Particle(type, x, y, vx, vy));
        }
    }

    private updateParticles(deltaTime: number): void {
        // Коэффициент для корректировки скорости в зависимости от времени кадра
        const timeScale = deltaTime / this.FRAME_DURATION;

        // Обновляем позиции частиц
        for (const p of this.particles) {
            // Обновление позиции
            p.x += p.vx * timeScale;
            p.y += p.vy * timeScale;

            // Проверка столкновений со стенами
            if (p.x < 0 || p.x > this.WIDTH) {
                p.vx *= -1;
                p.x = Math.max(0, Math.min(this.WIDTH, p.x));
            }
            if (p.y < 0 || p.y > this.HEIGHT) {
                p.vy *= -1;
                p.y = Math.max(0, Math.min(this.HEIGHT, p.y));
            }
        }

        // Взаимодействие между частицами (электромагнитные силы)
        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i];
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];

                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                // Избегаем деления на ноль и ограничиваем слишком сильные взаимодействия
                if (distance < 5) distance = 5;
                if (distance > 150) continue; // Игнорируем слишком далекие частицы

                // Рассчитываем силу по закону Кулона
                const force = 0.5 * p1.getCharge() * p2.getCharge() / (distance * distance) * timeScale;

                // Нормализуем направление
                const nx = dx / distance;
                const ny = dy / distance;

                // Применяем силу (F = ma, где m=1 для простоты)
                p1.vx -= force * nx;
                p1.vy -= force * ny;
                p2.vx += force * nx;
                p2.vy += force * ny;
            }
        }

        // Ограничение максимальной скорости
        const maxSpeed = 5.0;
        for (const p of this.particles) {
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > maxSpeed) {
                p.vx = (p.vx / speed) * maxSpeed;
                p.vy = (p.vy / speed) * maxSpeed;
            }
        }
    }

    private render(): void {
        // Очистка холста
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        // Рисуем частицы
        for (const particle of this.particles) {
            particle.draw(this.ctx);
        }

        // Выводим информацию
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Частиц: ${this.particles.length}`, 10, 20);
        this.ctx.fillText('Синий = электрон (-), Красный = протон (+)', 10, 40);
    }

    private animate(timestamp: number): void {
        if (!this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }

        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;

        this.updateParticles(deltaTime);
        this.render();

        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }

    start(): void {
        if (!this.animationFrameId) {
            this.lastTimestamp = 0;
            this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        }
    }

    stop(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}