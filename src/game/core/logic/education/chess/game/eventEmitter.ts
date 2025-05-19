export class EventEmitter {
    private events: Map<string, Function[]>;

    constructor() {
        this.events = new Map<string, Function[]>();
    }

    public on(event: string, callback: Function): void {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }

        this.events.get(event)!.push(callback);
    }

    public off(event: string, callback: Function): void {
        if (!this.events.has(event)) {
            return;
        }

        const callbacks = this.events.get(event)!;
        const index = callbacks.indexOf(callback);

        if (index !== -1) {
            callbacks.splice(index, 1);

            // Remove the event if there are no more callbacks
            if (callbacks.length === 0) {
                this.events.delete(event);
            }
        }
    }

    public emit(event: string, ...args: any[]): void {
        if (!this.events.has(event)) {
            return;
        }

        const callbacks = this.events.get(event)!;
        for (const callback of callbacks) {
            try {
                callback(...args);
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        }
    }

    public once(event: string, callback: Function): void {
        const onceCallback = (...args: any[]) => {
            this.off(event, onceCallback);
            callback(...args);
        };

        this.on(event, onceCallback);
    }

    public clear(event?: string): void {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }

    public listenerCount(event: string): number {
        return this.events.has(event) ? this.events.get(event)!.length : 0;
    }
}