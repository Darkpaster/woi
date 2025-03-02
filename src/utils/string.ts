export function formatString(string: string, ...args: number[]) {
    return string.replace(/{\d}/g, (key, _2) => args[Number(key.charAt(1))].toString());
}

export function randomString(...strings: string[]): string {
    return strings[Math.floor(Math.random() * strings.length)];
}