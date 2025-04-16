/**
 * physicsConstants.ts
 *
 * Основные физические константы, используемые для вычислений в различных разделах физики.
 * Значения взяты из общепринятых стандартов (SI) и других источников.
 */

export const PhysicalConstants = {
    // Термодинамические и макроскопические константы
    GRAVITY: 9.81, // m/s², стандартное ускорение свободного падения
    WATER_FREEZING_POINT: 0, // °C
    WATER_BOILING_POINT: 100, // °C
    ROOM_TEMPERATURE: 20, // °C
    SPECIFIC_HEAT_CAPACITY: {
        WATER: 4.186,  // Дж/(г·°C)
        ICE: 2.108,    // Дж/(г·°C)
        STEAM: 2.080,  // Дж/(г·°C)
        AIR: 1.005,    // Дж/(г·°C)
        METAL: 0.9,    // Дж/(г·°C) (средняя для металлов)
        ROCK: 0.8,     // Дж/(г·°C) (средняя для камней)
    } as const,
    THERMAL_CONDUCTIVITY: {
        WATER: 0.6,    // Вт/(м·°C)
        ICE: 2.2,      // Вт/(м·°C)
        STEAM: 0.016,  // Вт/(м·°C)
        AIR: 0.026,    // Вт/(м·°C)
        METAL: 50,     // Вт/(м·°C) (средняя для металлов)
        ROCK: 2.5,     // Вт/(м·°C) (средняя для камней)
    } as const,
    LATENT_HEAT: {
        WATER_FREEZING: 334,  // Дж/г
        WATER_BOILING: 2260,  // Дж/г
    } as const,
    DENSITY: {
        WATER: 1.0,    // г/см³
        ICE: 0.917,    // г/см³
        STEAM: 0.0006, // г/см³
        AIR: 0.0012,   // г/см³
        METAL: 8.0,    // г/см³ (средняя для металлов)
        ROCK: 2.7,     // г/см³ (средняя для камней)
    } as const,

    // Фундаментальные константы
    SPEED_OF_LIGHT: 2.99792458e8, // m/s, скорость света в вакууме
    GRAVITATIONAL_CONSTANT: 6.67430e-11, // m³/(kg·s²)
    PLANCK_CONSTANT: 6.62607015e-34, // J·s, постоянная Планка
    REDUCED_PLANCK_CONSTANT: 6.62607015e-34 / (2 * Math.PI), // ħ
    BOLTZMANN_CONSTANT: 1.380649e-23, // J/K
    AVOGADRO_NUMBER: 6.02214076e23, // 1/mol
    ELEMENTARY_CHARGE: 1.602176634e-19, // C, элементарный заряд
    ELECTRON_MASS: 9.10938356e-31, // kg, масса электрона
    PROTON_MASS: 1.672621898e-27, // kg, масса протона
    NEUTRON_MASS: 1.674927471e-27, // kg, масса нейтрона
    GAS_CONSTANT: 8.314462618, // J/(mol·K), универсальная газовая постоянная
    STEFAN_BOLTZMANN_CONSTANT: 5.670374419e-8, // W/(m²·K⁴), постоянная Стефана–Больцмана
    COULOMB_CONSTANT: 8.9875517923e9, // N·m²/C², постоянная Кулона
    STANDARD_GRAVITY: 9.80665, // m/s², стандартное ускорение свободного падения
    RYDBERG_CONSTANT: 1.0973731568160e7, // 1/m, постоянная Ридберга для водорода
    ELECTRIC_PERMITTIVITY_VACUUM: 8.854187817e-12, // F/m, диэлектрическая постоянная вакуума (ε₀)
    MAGNETIC_PERMEABILITY_VACUUM: 1.25663706212e-6, // H/m, магнитная постоянная вакуума (μ₀)
    STEFAN_BOLTZMANN_FACTOR: 4 * 5.670374419e-8, // W/(m²·K⁴)
    ELECTRON_VOLT: 1.602176634e-19, // J, 1 эВ в джоулях
    ATOMIC_MASS_UNIT: 1.66053906660e-27, // kg, атомная единица массы
    REFRACTIVE_INDEX_VACUUM: 1,

    // Дополнительные планковские константы
    PLANCK_LENGTH: 1.616255e-35, // m, Планковская длина
    PLANCK_TIME: 5.391247e-44,   // s, Планковское время
    PLANCK_MASS: 2.176434e-8,      // kg, Планковская масса
    PLANCK_TEMPERATURE: 1.416808e32 // K, Планковская температура
} as const;


/**
 * Перечисление фазовых состояний вещества
 */
export enum PhaseState {
    SOLID,
    LIQUID,
    GAS,
    PLASMA
}