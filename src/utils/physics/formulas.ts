/**
 * formulas.ts — набор утилитарных функций с базовыми физическими формулами.
 */

/** Рассчитывает скорость: speed = distance / time */
export function calculateSpeed(distance: number, time: number): number {
    if (time === 0) throw new Error("Time must be non-zero.");
    return distance / time;
}

/** Рассчитывает ускорение: a = (finalSpeed - initialSpeed) / deltaTime */
export function calculateAcceleration(initialSpeed: number, finalSpeed: number, deltaTime: number): number {
    if (deltaTime === 0) throw new Error("Delta time must be non-zero.");
    return (finalSpeed - initialSpeed) / deltaTime;
}

/** Закон Ньютона (вторая): force = mass * acceleration */
export function newtonsSecondLaw(mass: number, acceleration: number): number {
    return mass * acceleration;
}

/** Кинетическая энергия: KE = 0.5 * mass * (velocity)^2 */
export function kineticEnergy(mass: number, velocity: number): number {
    return 0.5 * mass * velocity ** 2;
}

/** Потенциальная энергия: PE = mass * gravitationalAcceleration * height */
export function potentialEnergy(mass: number, height: number, gravitationalAcceleration: number = 9.81): number {
    return mass * gravitationalAcceleration * height;
}

/** Работа: work = force * distance */
export function calculateWork(force: number, distance: number): number {
    return force * distance;
}

/** Мощность: power = work / time */
export function calculatePower(work: number, time: number): number {
    if (time === 0) throw new Error("Time must be non-zero.");
    return work / time;
}

/** Импульс: momentum = mass * velocity */
export function calculateMomentum(mass: number, velocity: number): number {
    return mass * velocity;
}

/** Закон всемирного тяготения: F = G * m1 * m2 / r² */
export function gravitationalForce(m1: number, m2: number, distance: number, gravitationalConstant: number = 6.67430e-11): number {
    if (distance === 0) throw new Error("Distance must be non-zero.");
    return gravitationalConstant * m1 * m2 / (distance ** 2);
}

/** Закон Бойля-Мариотта (при постоянной температуре): P1 * V1 = P2 * V2; возвращает V2 */
export function boyleMarriottVolume(P1: number, V1: number, P2: number): number {
    if (P2 === 0) throw new Error("P2 must be non-zero.");
    return (P1 * V1) / P2;
}

/** Уравнение состояния идеального газа: PV = nRT; возвращает давление */
export function idealGasPressure(n: number, R: number, T: number, V: number): number {
    if (V === 0) throw new Error("Volume must be non-zero.");
    return (n * R * T) / V;
}

/** Период колебаний математического маятника: T = 2π * sqrt(l/g) */
export function pendulumPeriod(length: number, gravitationalAcceleration: number = 9.81): number {
    if (length < 0) throw new Error("Length must be non-negative.");
    return 2 * Math.PI * Math.sqrt(length / gravitationalAcceleration);
}

/** Частота (в Гц) по периоду: frequency = 1 / T */
export function frequency(period: number): number {
    if (period === 0) throw new Error("Period must be non-zero.");
    return 1 / period;
}
