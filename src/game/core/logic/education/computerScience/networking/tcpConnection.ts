export class TCPConnection {
    private id: string;
    private sourcePort: number;
    private destPort: number;
    private state: TCPState;
    private sendBuffer: any[];
    private receiveBuffer: Map<number, any>;
    private nextSequenceNumber: number;
    private expectedSequenceNumber: number;

    constructor(id: string, sourcePort: number, destPort: number) {
        this.id = id;
        this.sourcePort = sourcePort;
        this.destPort = destPort;
        this.state = TCPState.SynReceived;
        this.sendBuffer = [];
        this.receiveBuffer = new Map<number, any>();
        this.nextSequenceNumber = 0;
        this.expectedSequenceNumber = 0;
    }

    public receiveData(data: any, sequenceNumber: number): void {
        if (sequenceNumber === this.expectedSequenceNumber) {
            // In-order packet
            this.expectedSequenceNumber++;

            // Process data
            console.log(`TCP Connection ${this.id} received data:`, data);

            // Process any buffered packets that are now in order
            while (this.receiveBuffer.has(this.expectedSequenceNumber)) {
                const bufferedData = this.receiveBuffer.get(this.expectedSequenceNumber);
                this.receiveBuffer.delete(this.expectedSequenceNumber);
                this.expectedSequenceNumber++;

                // Process data
                console.log(`TCP Connection ${this.id} processed buffered data:`, bufferedData);
            }
        } else {
            // Out-of-order packet, buffer it
            this.receiveBuffer.set(sequenceNumber, data);
        }
    }

    public sendData(data: any): number {
        const sequenceNumber = this.nextSequenceNumber++;
        this.sendBuffer.push({ data, sequenceNumber });
        return sequenceNumber;
    }
}

export enum TCPState {
    Closed,
    Listen,
    SynSent,
    SynReceived,
    Established,
    FinWait1,
    FinWait2,
    CloseWait,
    Closing,
    LastAck,
    TimeWait
}