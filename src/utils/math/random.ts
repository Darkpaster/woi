export function randomInt(min: number, max: number = 0): number {
    return max > 0 ? Math.round(Math.random() * (max - min)) + min :
        Math.round(Math.random() * min);
}
