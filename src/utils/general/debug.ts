export function logf(...logs: any[]) {
    let output = "";
    for (const [key, value] of Object.entries(logs)) {
        let newKey = key;
        let newValue = value;
        if (typeof value === "object" || typeof value === "object") {
            newKey = value.constructor.name;
            newValue = JSON.stringify(value);
        }else if (typeof value === "function") {
            newKey = value.name || "Function";
            newValue = value.toString();
        }
        output = output.concat(newKey, ": ", newValue, "\n");
    }
    console.log(output);
}
export function alertf(...logs: any[]) {
    let output = "";
    for (const [key, value] of Object.entries(logs)) {
        let newKey = key;
        let newValue = value;
        if (typeof value === "object" || typeof value === "object") {
            newKey = value.constructor.name;
            newValue = JSON.stringify(value);
        }else if (typeof value === "function") {
            newKey = value.name || "Function";
            newValue = value.toString();
        }
        output = output.concat(newKey, ": ", newValue, "\n");
    }
    alert(output);
}


export function logOnce() {
    const cache = new Map();

    return function (...data: any[]) {
        const key = data.toString();
        if (cache.has(key)) {
            return
        }
        console.log(data.toString());
        cache.set(key, data);
    }
}