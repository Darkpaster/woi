export class AccessControlList {
    private resourceId: string;
    private permissions: Map<string, Set<Permission>>;

    constructor(resourceId: string) {
        this.resourceId = resourceId;
        this.permissions = new Map<string, Set<Permission>>();
    }

    public addPermission(username: string, permission: Permission): void {
        if (!this.permissions.has(username)) {
            this.permissions.set(username, new Set<Permission>());
        }

        this.permissions.get(username)?.add(permission);
    }

    public removePermission(username: string, permission: Permission): void {
        const userPermissions = this.permissions.get(username);
        if (userPermissions) {
            userPermissions.delete(permission);
        }
    }

    public checkPermission(username: string, permission: Permission): boolean {
        const userPermissions = this.permissions.get(username);
        return userPermissions ? userPermissions.has(permission) : false;
    }

    public getAllPermissions(username: string): Permission[] {
        const userPermissions = this.permissions.get(username);
        return userPermissions ? Array.from(userPermissions) : [];
    }
}

export enum Permission {
    Read,
    Write,
    Execute,
    Delete,
    Admin
}