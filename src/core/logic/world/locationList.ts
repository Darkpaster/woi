import { spawnFloor } from "./spawn.ts";
import { spawnObjects } from "./spawn.ts";

let currentLocation: { floor: typeof spawnFloor; objects: typeof spawnObjects } | null = null;

export const droppedItems: any[] = [];

const locations: Record<string, { floor: typeof spawnFloor; objects: typeof spawnObjects }> = {
    spawn: {
        floor: spawnFloor,
        objects: spawnObjects
    },
}

export function getCurrentLocation(): { floor: typeof spawnFloor; objects: typeof spawnObjects } {
    return currentLocation ? currentLocation : locations.spawn;
}

export function setCurrentLocation(location: string): void {
    currentLocation = locations[location];
}