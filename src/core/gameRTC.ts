import { io, Socket } from "socket.io-client";

class GameRTC { //для очень часто обновляемых данных (координат)
    private socket: Socket;
    private peerConnection: RTCPeerConnection | null;
    private localStream: MediaStream | null;
    private roomId: string | null;
    private dataChannel: RTCDataChannel | null;

    constructor() {
        this.socket = io('http://localhost:3000');
        this.peerConnection = null;
        this.localStream = null;
        this.roomId = null;
        this.dataChannel = null;

        this.initSocketListeners();
    }

    private initSocketListeners(): void {
        this.socket.on('room-created', (roomId: string) => {
            this.roomId = roomId;
            console.log('Room created:', roomId);
        });

        this.socket.on('user-connected', () => {
            this.createOffer();
        });

        this.socket.on('ice-candidate', (candidate: RTCIceCandidateInit) => {
            if (this.peerConnection) {
                this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        this.socket.on('offer', async (offer: RTCSessionDescriptionInit) => {
            await this.handleOffer(offer);
        });

        this.socket.on('answer', async (answer: RTCSessionDescriptionInit) => {
            if (this.peerConnection) {
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });
    }

    public createRoom(): void {
        this.socket.emit('create-room');
    }

    public joinRoom(roomId: string): void {
        this.roomId = roomId;
        this.socket.emit('join-room', roomId);
    }

    public async initPeerConnection(): Promise<void> {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        };

        this.peerConnection = new RTCPeerConnection(configuration);

        if (this.peerConnection) {
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate && this.roomId) {
                    this.socket.emit('ice-candidate', event.candidate, this.roomId);
                }
            };

            this.dataChannel = this.peerConnection.createDataChannel('gameData');

            if (this.dataChannel) {
                this.dataChannel.onopen = () => {
                    console.log('Data channel is open');
                };

                this.dataChannel.onmessage = (event) => {
                    // Обработка входящих игровых данных
                    const data = JSON.parse(event.data);
                    this.handleGameData(data);
                };
            }
        }
    }

    public async createOffer(): Promise<void> {
        await this.initPeerConnection();

        if (this.peerConnection) {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            if (this.roomId) {
                this.socket.emit('offer', offer, this.roomId);
            }
        }
    }

    public async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
        await 	this.initPeerConnection();

        if(this.peerConnection){
            await 	this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(offer)
            );

            const answer = await 	this.peerConnection.createAnswer();
            await 	this.peerConnection.setLocalDescription(answer);

            if(this.roomId){
                this.socket.emit('answer', answer, 	this.roomId);
            }
        }
    }

    public sendPlayerPosition(x: number, y: number, z: number): void {
        if(this.dataChannel && 	this.dataChannel.readyState === 'open') {
            const positionData = JSON.stringify({ type:'position', x,y,z });
            this.dataChannel.send(positionData);
        }
    }

    public handleGameData(data:{type:string,x:number,y:number,z:number}): void {
        switch(data.type){
            case 'position':
                this.updateRemotePlayerPosition(data.x,data.y,data.z);
                break;
        }
    }

    public updateRemotePlayerPosition(x:number,y:number,z:number):void{
        console.log('Remote player position:',x,y,z);
    }
}

const gameRTC : GameRTC= new GameRTC();

gameRTC.createRoom();

setInterval(() => { gameRTC.sendPlayerPosition( Math.random() * 100, Math.random() * 100, Math.random() * 100 ); }, 100);