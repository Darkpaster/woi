export class Message {
    static logList: Message[] = [];
    author: string;
    content: string;
    color?: string;

    constructor(author: string, content: string) {
        this.author = author + ": ";
        this.content = content;
    }

    add(color: string): void {
        this.color = color;
        if (!Message.logList.includes(this)) {
            Message.logList.push(this);
        }
    }
}

export function log(author: string, content: string, color: string = "white"): void {
    new Message(author, content).add(color);
}

export function getLogHistory(): Message[] {
    return Message.logList;
}