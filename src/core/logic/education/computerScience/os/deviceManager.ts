export class DeviceManager {
    private devices: Device[];

    constructor() {
        this.devices = [];
    }

    public addDevice(device: Device): void {
        this.devices.push(device);
    }

    public removeDevice(device: Device): void {
        const index = this.devices.indexOf(device);
        if (index !== -1) {
            this.devices.splice(index, 1);
        }
    }

    public getDevice(name: string): Device | undefined {
        return this.devices.find(device => device.getName() === name);
    }

    public simulate(timeStep: number): void {
        this.devices.forEach(device => {
            device.simulate(timeStep);
        });
    }
}