export class User {
    private username: string;
    private passwordHash: string;
    private role: UserRole;
    private isLocked: boolean;
    private lastLogin: Date | null;

    constructor(username: string, passwordHash: string, role: UserRole) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
        this.isLocked = false;
        this.lastLogin = null;
    }

    public getUsername(): string {
        return this.username;
    }

    public getRole(): UserRole {
        return this.role;
    }

    public verifyPassword(passwordHash: string): boolean {
        return this.passwordHash === passwordHash;
    }

    public lockAccount(): void {
        this.isLocked = true;
    }

    public unlockAccount(): void {
        this.isLocked = false;
    }

    public isAccountLocked(): boolean {
        return this.isLocked;
    }

    public updateLastLogin(): void {
        this.lastLogin = new Date();
    }

    public getLastLogin(): Date | null {
        return this.lastLogin;
    }
}

export enum UserRole {
    Admin,
    Manager,
    User,
    Guest
}