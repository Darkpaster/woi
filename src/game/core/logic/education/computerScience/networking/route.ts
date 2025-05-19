export class Route {
    public destination: string;
    public nextHop: string;
    public metric: number;

    constructor(destination: string, nextHop: string, metric: number) {
        this.destination = destination;
        this.nextHop = nextHop;
        this.metric = metric;
    }
}