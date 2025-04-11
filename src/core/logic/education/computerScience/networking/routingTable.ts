import {Route} from "./route.ts";

export class RoutingTable {
    private routes: Route[];

    constructor() {
        this.routes = [];
    }

    public addRoute(destination: string, nextHop: string, metric: number): void {
        this.routes.push(new Route(destination, nextHop, metric));
    }

    public removeRoute(destination: string): void {
        this.routes = this.routes.filter(route => route.destination !== destination);
    }

    public getNextHop(destination: string): string | null {
        const route = this.routes.find(route => this.matchesNetwork(destination, route.destination));
        return route ? route.nextHop : null;
    }

    private matchesNetwork(ip: string, network: string): boolean {
        // Simple implementation - would need proper subnet matching in real code
        return ip.startsWith(network.split('.').slice(0, 3).join('.'));
    }
}