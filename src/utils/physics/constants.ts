/**
 * physicsConstants.ts
 *
 * Основные физические константы, используемые для вычислений в различных разделах физики.
 * Значения взяты из общепринятых стандартов (SI).
 */

export const SPEED_OF_LIGHT = 2.99792458e8; // m/s, скорость света в вакууме

export const GRAVITATIONAL_CONSTANT = 6.67430e-11; // m^3/(kg*s^2), гравитационная постоянная

export const PLANCK_CONSTANT = 6.62607015e-34; // J*s, постоянная Планка (точное значение)
export const REDUCED_PLANCK_CONSTANT = PLANCK_CONSTANT / (2 * Math.PI); // ħ, редуцированная постоянная Планка

export const BOLTZMANN_CONSTANT = 1.380649e-23; // J/K, постоянная Больцмана

export const AVOGADRO_NUMBER = 6.02214076e23; // 1/mol, число Авогадро

export const ELEMENTARY_CHARGE = 1.602176634e-19; // C, элементарный заряд

export const ELECTRON_MASS = 9.10938356e-31; // kg, масса электрона
export const PROTON_MASS = 1.672621898e-27; // kg, масса протона
export const NEUTRON_MASS = 1.674927471e-27; // kg, масса нейтрона

export const GAS_CONSTANT = 8.314462618; // J/(mol*K), универсальная газовая постоянная

export const STEFAN_BOLTZMANN_CONSTANT = 5.670374419e-8; // W/(m^2*K^4), постоянная Стефана-Больцмана

export const COULOMB_CONSTANT = 8.9875517923e9; // N*m^2/C^2, постоянная Кулона (k_e)

export const STANDARD_GRAVITY = 9.80665; // m/s^2, стандартное ускорение свободного падения

export const RYDBERG_CONSTANT = 1.0973731568160e7; // 1/m, постоянная Ридберга для водорода

export const ELECTRIC_PERMITTIVITY_VACUUM = 8.854187817e-12; // F/m, диэлектрическая постоянная вакуума (ε0)
export const MAGNETIC_PERMEABILITY_VACUUM = 1.25663706212e-6; // H/m, магнитная постоянная вакуума (μ0)

export const STEFAN_BOLTZMANN_FACTOR = 4 * STEFAN_BOLTZMANN_CONSTANT; // возможно пригодится для некоторых расчетов

// Дополнительные константы для квантовой механики/химии:
export const ELECTRON_VOLT = 1.602176634e-19; // J, 1 эВ в джоулях
export const ATOMIC_MASS_UNIT = 1.66053906660e-27; // kg, атомная единица массы

// Примеры для оптики:
export const REFRACTIVE_INDEX_VACUUM = 1; // показатель преломления вакуума
