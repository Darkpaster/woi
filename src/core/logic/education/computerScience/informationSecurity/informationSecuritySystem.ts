export class InformationSecuritySystem extends SimulationEntity {
    private users: User[];
    private resources: SecureResource[];
    private accessControlLists: Map<string, AccessControlList>;
    private activeAttacks: Attack[];
    private logs: SecurityLog[];

    constructor(id: string, name: string, description: string) {
        super(id, name, description);
        this.users = [];
        this.resources = [];
        this.accessControlLists = new Map<string, AccessControlList>();
        this.activeAttacks = [];
        this.logs = [];
    }

    public addUser(username: string, passwordHash: string, role: UserRole): User {
        const user = new User(username, passwordHash, role);
        this.users.push(user);
        return user;
    }

    public addResource(name: string, type: ResourceType, sensitivity: SensitivityLevel): SecureResource {
        const resource = new SecureResource(name, type, sensitivity);
        this.resources.push(resource);

        // Create default ACL for the resource
        const acl = new AccessControlList(resource.getId());
        this.accessControlLists.set(resource.getId(), acl);

        return resource;
    }

    public grantAccess(user: User, resource: SecureResource, permission: Permission): boolean {
        const acl = this.accessControlLists.get(resource.getId());
        if (!acl) return false;

        acl.addPermission(user.getUsername(), permission);
        return true;
    }

    public revokeAccess(user: User, resource: SecureResource, permission: Permission): boolean {
        const acl = this.accessControlLists.get(resource.getId());
        if (!acl) return false;

        acl.removePermission(user.getUsername(), permission);
        return true;
    }

    public authenticateUser(username: string, passwordHash: string): User | null {
        const user = this.users.find(u => u.getUsername() === username && u.verifyPassword(passwordHash));

        if (user) {
            this.logEvent(SecurityEventType.Authentication, username, "User authenticated successfully");
        } else {
            this.logEvent(SecurityEventType.AuthenticationFailure, username, "Authentication failed");
        }

        return user || null;
    }

    public authorizeAccess(user: User, resource: SecureResource, requestedPermission: Permission): boolean {
        const acl = this.accessControlLists.get(resource.getId());
        if (!acl) return false;

        const isAuthorized = acl.checkPermission(user.getUsername(), requestedPermission);

        if (isAuthorized) {
            this.logEvent(
                SecurityEventType.Authorization,
                user.getUsername(),
                `Access granted to ${resource.getName()}`
            );
        } else {
            this.logEvent(
                SecurityEventType.AuthorizationFailure,
                user.getUsername(),
                `Access denied to ${resource.getName()}`
            );
        }

        return isAuthorized;
    }

    public simulateAttack(attackType: AttackType, target: string): Attack {
        const attack = new Attack(attackType, target);
        this.activeAttacks.push(attack);

        this.logEvent(
            SecurityEventType.SecurityIncident,
            "SYSTEM",
            `Attack detected: ${attackType} targeting ${target}`
        );

        return attack;
    }

    public applySecurityPatch(vulnerability: string): void {
        // Remove attacks exploiting this vulnerability
        this.activeAttacks = this.activeAttacks.filter(attack => attack.getTarget() !== vulnerability);

        this.logEvent(
            SecurityEventType.SystemUpdate,
            "SYSTEM",
            `Security patch applied for ${vulnerability}`
        );
    }

    public encryptData(data: string, key: string): string {
        // Simple XOR encryption for simulations
        let encrypted = "";
        for (let i = 0; i < data.length; i++) {
            encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return encrypted;
    }

    public decryptData(encryptedData: string, key: string): string {
        // XOR decryption (same as encryption)
        return this.encryptData(encryptedData, key);
    }

    private logEvent(type: SecurityEventType, user: string, message: string): void {
        const log = new SecurityLog(type, user, message);
        this.logs.push(log);

        // Trim logs if too many
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(-1000);
        }
    }

    public getLogs(filter?: SecurityEventType): SecurityLog[] {
        if (filter === undefined) {
            return [...this.logs];
        }
        return this.logs.filter(log => log.getType() === filter);
    }

    public simulate(timeStep: number): void {
        // Process ongoing attacks
        this.activeAttacks.forEach(attack => {
            attack.progress(timeStep);

            if (attack.isSuccessful()) {
                this.logEvent(
                    SecurityEventType.SecurityBreach,
                    "SYSTEM",
                    `Security breach: ${attack.getType()} succeeded against ${attack.getTarget()}`
                );
            }
        });

        // Clean up completed attacks
        this.activeAttacks = this.activeAttacks.filter(attack => !attack.isCompleted());
    }

    public render(): void {
        console.log("Security System Status:");
        console.log(`Users: ${this.users.length}`);
        console.log(`Protected Resources: ${this.resources.length}`);
        console.log(`Active Attacks: ${this.activeAttacks.length}`);
        console.log(`Security Logs: ${this.logs.length}`);
    }
}