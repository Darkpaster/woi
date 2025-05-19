export class Attack {
    private type: AttackType;
    private target: string;
    private progress: number;
    private duration: number;
    private successProbability: number;
    private completed: boolean;
    private successful: boolean;

    constructor(type: AttackType, target: string) {
        this.type = type;
        this.target = target;
        this.progress = 0;

        // Set attack parameters based on type
        switch (type) {
            case AttackType.DDoS:
                this.duration = 300; // 5 minutes
                this.successProbability = 0.7;
                break;
            case AttackType.Phishing:
                this.duration = 1800; // 30 minutes
                this.successProbability = 0.4;
                break;
            case AttackType.SQLInjection:
                this.duration = 600; // 10 minutes
                this.successProbability = 0.5;
                break;
            case AttackType.BruteForce:
                this.duration = 3600; // 1 hour
                this.successProbability = 0.3;
                break;
            default:
                this.duration = 1200; // 20 minutes
                this.successProbability = 0.6;
        }

        this.completed = false;
        this.successful = false;
    }

    public getType(): AttackType {
        return this.type;
    }

    public getTarget(): string {
        return this.target;
    }

    public progress(timeStep: number): void {
        if (this.completed) return;

        this.progress += timeStep / this.duration;

        if (this.progress >= 1) {
            this.completed = true;
            this.successful = Math.random() < this.successProbability;
        }
    }

    public isCompleted(): boolean {
        return this.completed;
    }

    public isSuccessful(): boolean {
        return this.completed && this.successful;
    }

    public getProgressPercentage(): number {
        return Math.min(1, this.progress) * 100;
    }
}

export enum AttackType {
    DDoS,
    Phishing,
    SQLInjection,
    XSS,
    BruteForce,
    Malware,
    ManInTheMiddle
}