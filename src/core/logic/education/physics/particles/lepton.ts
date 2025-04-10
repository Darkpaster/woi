import { Particle, Color } from './particle';
import { Vector2D } from './utils';

export abstract class Lepton extends Particle {
    constructor(position: Vector2D, mass: number, charge: number, spin: number) {
        super(position, mass, charge, spin);
    }

    // Каждый лептон должен иметь возможность создать свою античастицу
    abstract createAntiParticle(): Lepton;

    // Поведение лептонов при столкновении
    interact(other: Particle): void {
        // Если сталкиваемся с нашей античастицей - аннигилируем
        if (other instanceof Lepton && this.isAntiParticleOf(other)) {
            this.annihilate(other as Lepton);
            return;
        }

        // Базовое электромагнитное взаимодействие
        const force = this.calculateElectromagneticForce(other);
        this.applyForce(force);
    }

    // Проверяем, является ли другая частица античастицей для данной
    isAntiParticleOf(other: Lepton): boolean {
        return this.mass === other.mass &&
            this.charge === -other.charge &&
            this.spin === other.spin;
    }

    // Аннигиляция при встрече с античастицей
    private annihilate(antiparticle: Lepton): void {
        // Здесь можно добавить логику аннигиляции
        // Например, создание гамма-квантов или других частиц
        console.log(`Аннигиляция: ${this.name} + ${antiparticle.name}`);
    }

    // Расчет электромагнитной силы между частицами
    protected calculateElectromagneticForce(other: Particle): Vector2D {
        const dx = other.getPosition().x - this.position.x;
        const dy = other.getPosition().y - this.position.y;
        const distanceSquared = dx * dx + dy * dy;

        // Избегаем деления на ноль
        if (distanceSquared < 0.0001) {
            return { x: 0, y: 0 };
        }

        // Константа для силы (упрощенно)
        const k = 0.5;

        // Закон Кулона: F = k * q1 * q2 / r^2
        const forceMagnitude = k * this.charge * other.getCharge() / distanceSquared;

        // Нормализуем вектор направления
        const distance = Math.sqrt(distanceSquared);
        const forceX = forceMagnitude * dx / distance;
        const forceY = forceMagnitude * dy / distance;

        return { x: forceX, y: forceY };
    }

    // Квантовые свойства лептонов
    oscillate(time: number): void {
        // Квантовое колебание - может влиять на вероятностное распределение
        const frequency = 0.1;
        const amplitude = 0.5;

        const oscillation = Math.sin(time * frequency) * amplitude;
        this.radius = this.radius * (1 + oscillation * 0.2);
    }

    // Переопределение метода обновления с учетом квантовых свойств
    update(deltaTime: number): void {
        super.update(deltaTime);
        this.oscillate(this.age);
    }
}

// Мюон - тяжелый лептон
export class Muon extends Lepton {
    constructor(position: Vector2D) {
        // Параметры мюона: масса больше электрона, заряд -1, спин 0.5
        super(position, 0.105, -1, 0.5);
        this.color = { r: 100, g: 200, b: 100 };
        this.radius = 4;
        this.name = 'μ-';
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Мюон имеет более короткое время жизни - отражаем это визуально
        const lifespan = 2.2; // мюоны живут примерно 2.2 микросекунды
        const opacity = Math.max(0, 1 - this.age / lifespan);

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 200, 100, ${opacity * 0.2})`;
        ctx.fill();
    }

    createAntiParticle(): Lepton {
        return new AntiMuon({ x: this.position.x, y: this.position.y });
    }

    // Мюоны распадаются со временем
    update(deltaTime: number): void {
        super.update(deltaTime);

        // Вероятность распада зависит от времени жизни
        const decayProbability = deltaTime / 2.2;
        if (Math.random() < decayProbability) {
            this.decay();
        }
    }

    private decay(): void {
        // Мюон распадается на электрон и два нейтрино
        console.log(`${this.name} распался`);
        // Здесь можно добавить логику создания продуктов распада
    }
}

export class AntiMuon extends Lepton {
    constructor(position: Vector2D) {
        // Параметры антимюона: масса как у мюона, заряд +1, спин 0.5
        super(position, 0.105, 1, 0.5);
        this.color = { r: 200, g: 100, b: 200 };
        this.radius = 4;
        this.name = 'μ+';
        this.antiParticle = true;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Антимюон также имеет короткое время жизни
        const lifespan = 2.2;
        const opacity = Math.max(0, 1 - this.age / lifespan);

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 100, 200, ${opacity * 0.2})`;
        ctx.fill();
    }

    createAntiParticle(): Lepton {
        return new Muon({ x: this.position.x, y: this.position.y });
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Такая же вероятность распада, как у мюона
        const decayProbability = deltaTime / 2.2;
        if (Math.random() < decayProbability) {
            this.decay();
        }
    }

    private decay(): void {
        console.log(`${this.name} распался`);
        // Логика создания продуктов распада
    }
}

// Тау-лептон - самый тяжелый лептон
export class Tau extends Lepton {
    constructor(position: Vector2D) {
        // Параметры тау-лептона: большая масса, заряд -1, спин 0.5
        super(position, 1.777, -1, 0.5);
        this.color = { r: 150, g: 50, b: 200 };
        this.radius = 5;
        this.name = 'τ-';
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        // Тау имеет очень короткое время жизни
        const lifespan = 0.0003; // примерно 0.3 пикосекунды
        const opacity = Math.max(0, 1 - this.age / lifespan);

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 50, 200, ${opacity * 0.2})`;
        ctx.fill();
    }

    createAntiParticle(): Lepton {
        return new AntiTau({ x: this.position.x, y: this.position.y });
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        // Большая вероятность распада из-за очень короткого времени жизни
        const decayProbability = deltaTime / 0.0003;
        if (Math.random() < decayProbability) {
            this.decay();
        }
    }

    private decay(): void {
        console.log(`${this.name} распался`);
        // Тау имеет много каналов распада
    }
}

export class AntiTau extends Lepton {
    constructor(position: Vector2D) {
        super(position, 1.777, 1, 0.5);
        this.color = { r: 200, g: 50, b: 150 };
        this.radius = 5;
        this.name = 'τ+';
        this.antiParticle = true;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        const lifespan = 0.0003;
        const opacity = Math.max(0, 1 - this.age / lifespan);

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 50, 150, ${opacity * 0.2})`;
        ctx.fill();
    }

    createAntiParticle(): Lepton {
        return new Tau({ x: this.position.x, y: this.position.y });
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        const decayProbability = deltaTime / 0.0003;
        if (Math.random() < decayProbability) {
            this.decay();
        }
    }

    private decay(): void {
        console.log(`${this.name} распался`);
    }
}