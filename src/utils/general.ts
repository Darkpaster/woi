export function memoize(fn: (args: any[]) => any) {
    const cache = new Map();

    return function (...args: any[]) {
        const key = args.toString();
        if (cache.has(key)) {
            return cache.get(key)
        }
        const result = fn(...args);
        cache.set(key, result);
        return result
    }
}

function keysProjection(objects, keys) { // filter for objects keys
    if (objects.length === 0) return objects;

    return objects.map(object => Object.fromEntries(Object.entries(object).filter(([key]) => keys.includes(key))));
}

export function compareObjects(o1, o2) { //returns true if objectsz are equal
    if (Object.keys(o1).length !== Object.keys(o2).length) {
        return false;
    }

    return Object.keys(o1)
        .every(k => Object.hasOwn(o2, k) && Object.is(o1[k], o2[k]));
}

export function frequency(arr) { //returns [[value, amountOfValue]...]
    const arrs = []
    for (const value of arr) {
        if (arrs.flat().includes(value)) {
            continue
        }
        let count = 0;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === value) {
                count++
            }
            if (i + 1 === arr.length) {
                arrs.push([value, count])
            }
        }
    }
    return arrs
}