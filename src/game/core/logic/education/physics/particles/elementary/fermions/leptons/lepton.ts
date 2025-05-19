import { Particle } from '../../../particle.ts';
import {Vector2D} from "../../../../../../../../../utils/math/2d.ts";

export abstract class Lepton extends Particle {
    protected constructor(position: Vector2D, mass: number, charge: number, spin: number) {
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
            return new Vector2D(0, 0);
        }

        // Константа для силы (упрощенно)
        const k = 0.5;

        // Закон Кулона: F = k * q1 * q2 / r^2
        const forceMagnitude = k * this.charge * other.getCharge() / distanceSquared;

        // Нормализуем вектор направления
        const distance = Math.sqrt(distanceSquared);
        const forceX = forceMagnitude * dx / distance;
        const forceY = forceMagnitude * dy / distance;

        return new Vector2D(forceX, forceY);
    }

    // Квантовые свойства лептонов
    oscillate(time: number): void {
        // Квантовое колебание - может влиять на вероятностное распределение
        // const frequency = 0.1;
        // const amplitude = 0.5;
        //
        // const oscillation = Math.sin(time * frequency) * amplitude;
        // this.radius = this.radius * (1 + oscillation * 0.1);
    }

    // Переопределение метода обновления с учетом квантовых свойств
    update(deltaTime: number): void {
        super.update(deltaTime);
        this.oscillate(this.age);
    }
}