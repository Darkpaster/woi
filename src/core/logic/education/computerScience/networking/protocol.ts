import {Packet} from "./packet.ts";

export interface Protocol {
    getName(): string;
    processPacket(packet: Packet): void;
}