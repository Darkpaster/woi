export class SecurityLog {
    private timestamp: Date;
    private type: SecurityEventType;
    private user: string;
    private message: string;

    constructor(type: SecurityEventType, user: string, message: string) {
        this.timestamp = new Date();
        this.type = type;
        this.user = user;
        this.message = message;
    }

    public getTimestamp(): Date {
        return this.timestamp;
    }

    public getType(): SecurityEventType {
        return this.type;
    }

    public getUser(): string {
        return this.user;
    }

    public getMessage(): string {
        return this.message;
    }

    public toString(): string {
        return `[${this.timestamp.toISOString()}] [${SecurityEventType[this.type]}] [${this.user}] ${this.message}`;
    }
}

export enum SecurityEventType {
    Authentication,
    AuthenticationFailure,
    Authorization,
    AuthorizationFailure,
    SecurityIncident,
    SecurityBreach,
    SystemUpdate,
    ConfigurationChange
}