export class Message {
    private id: string;
    private source: string;
    private destination: string;
    private content: any;
    private timestamp: Date;

    constructor(source: string, destination: string, content: any) {
        this.id = `msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        this.source = source;
        this.destination = destination;
        this.content = content;
        this.timestamp = new Date();
    }

    public getId(): string {
        return this.id;
    }

    public getSource(): string {
        return this.source;
    }

    public getDestination(): string {
        return this.destination;
    }

    public getContent(): any {
        return this.content;
    }

    public getTimestamp(): Date {
        return this.timestamp;
    }
}
