import { io, Socket } from "socket.io-client";
import {Player} from "../../core/logic/actors/player.ts";
import {entityManager, player} from "../../core/main.ts";

type CharacterDTO = {
    name: string, id: number, x: number, y: number, bubble: string, renderState: string,
}

export class GameRTC {

    get socket(): Socket {
        return this._socket;
    }

    set socket(value: Socket) {
        this._socket = value;
    }

    private _socket: Socket;
    private peerConnection: RTCPeerConnection | null;
    private localStream: MediaStream | null;
    private roomId: string | null;
    private dataChannel: RTCDataChannel | null;

    constructor() {
        this._socket = io('http://localhost:8050/ws-chat', {
            withCredentials: true,
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
        this.peerConnection = null;
        this.localStream = null;
        this.roomId = null;
        this.dataChannel = null;

        this.initSocketListeners();
    }

    private createPlayer(character: CharacterDTO) {
        const newPlayer = new Player();
        newPlayer.name = character.name;
        newPlayer.id = character.id;
        newPlayer.x = character.x;
        newPlayer.y = character.y;
        return newPlayer;
    }

    private initSocketListeners(): void {
        this.socket.on('roomCreated', (roomId: string) => {
            this.roomId = roomId;
            console.log('Room created:', roomId);
        });

        this.socket.on('userConnected', (character: CharacterDTO) => {
            console.log("player connected: "+character.id);

            this.initNewPlayer(this.createPlayer(character));

            // this.createOffer();
        });

        this.socket.on('connect', () => {
            console.log('Socket connected successfully');
            console.log('Socket ID:', this._socket.id);
        });

        this.socket.on('connectError', (error) => {
            console.error('Connection error:', error);
        });

        this.socket.on("receivePosition", (character: CharacterDTO) => {
            if (entityManager.hasPlayer(character.id)) {
                const pl = entityManager.getPlayer(character.id);
                pl!.x = character.x;
                pl!.y = character.y
            }
        })

        this.socket.on("allUsersConnected", (characters: CharacterDTO[] ) => {
            for (const character of characters) {
                console.log(`allUsersConnected: ${character.id}`)
                this.initNewPlayer(this.createPlayer(character));
            }
        })

        this.socket.on("sendToInitUser", (requestId: number) => {
            console.log(`sendToInitUser: ${requestId}`)
            this.socket.emit("initUserResponse",{ requestId: requestId, characterData:
                    { name: player.name, id: player.id, x: player.x, y: player.y, bubble: "", renderState: "idle", roomID: this.roomId } });
        })



        // this._socket.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
        //     if (this.peerConnection && this.peerConnection.currentRemoteDescription && this.peerConnection.currentLocalDescription) {
        //         await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        //     }
        // });
        //
        // this._socket.on('offer', async (offer: RTCSessionDescriptionInit) => {
        //     await this.handleOffer(offer);
        // });
        //
        // this._socket.on('answer', async (answer: RTCSessionDescriptionInit) => {
        //     if (this.peerConnection && this.peerConnection.currentRemoteDescription) {
        //         await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        //     }
        // });
    }

    private initNewPlayer(char: Player) {
        if (!entityManager.hasPlayer(char.id)) {
            if (player?.id !== char.id) {
                entityManager.addPlayer(char);
            } else {
                console.log("it's me")
            }
        } else {
            alert("player duplicate: "+char.id)
        }
    }

    public createRoom(id = "public"): void {
        this._socket.emit('createRoom', id);
    }

    public joinRoom(roomId: string, player: Player): void {
        this.roomId = roomId;
        // alert(`player.id: ${player.id}`)
        this._socket.timeout(1000).emit("joinRoom", { name: player.name, id: player.id, x: player.x, y: player.y, bubble: "", renderState: "idle", roomID: roomId }, (err: any): void => {
            if (err) {
                alert("Ошибка подключения ("+err.toString()+")")
            }
        })
    }

    public initUsers(player: Player) {
        this._socket.timeout(3000).emit("initUsers", { name: player.name, id: player.id, x: player.x, y: player.y, bubble: "", renderState: "idle", roomID: this.roomId }, (err: any): void => {
            if (err) {
                alert("Ошибка инициализации игроков ("+err.toString()+")")
            }
        })
    }

    public async initPeerConnection(): Promise<void> {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'turn:turn.viagenie.ca', username: 'webrtc@live.com', credential: 'webrtc' }
            ]
        };

        this.peerConnection = new RTCPeerConnection(configuration);


        if (this.peerConnection) {
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate && this.roomId) {
                    this._socket.emit('ice-candidate', {candidate: event.candidate, roomId: this.roomId});
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
        } else {
            alert("!this.peerConnection")
        }

        this.peerConnection.onconnectionstatechange = (event) => {
            console.log('Connection state:', this.peerConnection!.connectionState);
        };

        this.peerConnection.ondatachannel = (event) => {
            console.log('Data channel received:', event.channel.label);
            const receivedChannel = event.channel;
            console.log(event.channel.id)
        };
    }

    public async createOffer(): Promise<void> {
        if (!this.peerConnection) {
            await this.initPeerConnection();
        }

        if (this.peerConnection) {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            if (this.roomId) {
                this._socket.emit('offer', offer, this.roomId);
            }
        }
    }

    public async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
        if (!this.peerConnection) {
            await this.initPeerConnection();
        }

        if(this.peerConnection){
            await this.peerConnection.setRemoteDescription(offer);

            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            if(this.roomId){
                this._socket.emit('answer', answer, this.roomId);
            }
        }
    }

    public sendPlayerPosition(id: number, x: number, y: number): void {
        // console.log(`sent position: ${x}, ${y}`)

        this.socket.emit('sendPosition', { id: id, x: x, y: y });

        // if(this.dataChannel && 	this.dataChannel.readyState === 'open') {
        //     const positionData = JSON.stringify({ type:'position', x,y });
        //     this.dataChannel.send(positionData);
        // } else {
        //     console.log("Data channel not ready:",
        //         this.dataChannel ? this.dataChannel.readyState : 'null');
        // }
    }

    public handleGameData(data:{type:string,x:number,y:number}): void {
        switch(data.type){
            case 'position':
                this.updateRemotePlayerPosition(data.x,data.y);
                break;
        }
    }

    public updateRemotePlayerPosition(x:number,y:number):void{
        console.log('Remote player position:',x,y);
    }

    public close() {
        if (this.peerConnection?.connectionState === "connected") {
            this.peerConnection?.close();
        }
        this.socket.disconnect();
    }
}

