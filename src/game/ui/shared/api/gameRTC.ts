import {io, Socket} from "socket.io-client";
import Player from "../../../core/logic/actors/player.ts";
import {entityManager, player} from "../../../core/main.ts";
import {settings} from "../../../core/config/settings.ts";
import {SmallPotionOfHealing} from "../../../core/logic/items/consumable/potions/smallPotionOfHealing.ts";
import Item from "../../../core/logic/items/item.ts";
import BlueSlime from "../../../core/logic/actors/mobs/enemies/blueSlime.ts";
import {ActorDTO, DamageDTOType, ItemDTO} from "../../../core/types.ts";

export type CharacterInit = {
    nickname: string,
    characterId: number,
    roomId: string,
    characterType: "wanderer" | "samurai" | "knight" | "werewolf" | "mage"
}

export function getItemByName(name: string, ids: number[]): Item {
    switch (name) {
        case "Small Potion Of Healing":
            new SmallPotionOfHealing(ids);
            break
    }
    console.log("noooo!")
    return new Item(ids);
}

export function getMobByName(name: string): BlueSlime {
    switch (name) {
        case "Skime":
            new BlueSlime();
            break
    }
    console.log("noooo!!!")
    return new BlueSlime();
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
        this._socket = io('http://localhost:8050/ws-general', {
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

    private createPlayer(character: CharacterInit) {
        const newPlayer = new Player();
        newPlayer.name = character.nickname;
        newPlayer.id = character.characterId;
        return newPlayer;
    }

    public sendPlayerPosition(): void {
        this.socket.emit('sendPlayerPosition', {
            actorId: player?.id,
            x: Math.round(player?.x / settings.defaultTileScale),
            y: Math.round(player?.y / settings.defaultTileScale),
            renderState: player?.renderState,
            health: player?.HP
        });
    }

    public dealDamage(dmg: DamageDTOType) {
        this.socket.emit("dealDamage", {
            value: dmg.value,
            target: {targetId: dmg.target.targetId, targetType: dmg.target.targetType}
        });
    }

    private initSocketListeners(): void {
        this.socket.on('roomCreated', (roomId: string) => {
            this.roomId = roomId;
            console.log('Room created:', roomId);
        });

        this.socket.on('userConnected', (character: CharacterInit) => {
            console.log("player connected: " + character.characterId);

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

        this.socket.on("receivePlayerPosition", (position: ActorDTO) => {
            if (entityManager.hasPlayer(position.actorId)) {
                const pl = entityManager.getPlayer(position.actorId);
                pl!.x = position.x * settings.defaultTileScale;
                pl!.y = position.y * settings.defaultTileScale;
            }
        })


        this.socket.on("updateAllMobs", (data) => {
            const parsedData: ActorDTO[] = JSON.parse(JSON.stringify(data));
            // console.log(JSON.stringify(data))
            for (const updatedMob of parsedData) {
                entityManager.updateMob(updatedMob);
            }
        })

        // this.socket.on("spawnMob", (data) => {
        //     const mob: ActorDTO = JSON.parse(JSON.stringify(data));
        //     console.log("respawned: " + mob.actorId);
        //     const newMob = new getMobByName(mob.);
        //     newMob.x = updatedMob.x * settings.defaultTileScale;
        //     newMob.y = updatedMob.y * settings.defaultTileScale;
        //     newMob.id = updatedMob.actorId;
        //     newMob.HP = updatedMob.health;
        //     entityManager.addMob(newMob);
        // })


        this
            .socket
            .on(
                "addItem"
                , (
                    item: ItemDTO
                ) => {
                    const
                        newItem: Item = getItemByName(item.name, [item.id]);
                    newItem
                        .x = item.x * settings.defaultTileScale;
                    newItem
                        .y = item.y * settings.defaultTileScale;
                    entityManager
                        .addItem(newItem);
                }
            )

        this.socket.on("deleteItem", (item: ItemDTO) => {
            entityManager.removeItem([item.id]);
        })

        this.socket.on("allUsersConnected", (characters: CharacterInit[]) => {
            for (const character of characters) {
                console.log(`allUsersConnected: ${character.characterId}`)
                this.initNewPlayer(this.createPlayer(character));
            }
        })

        this.socket.on("sendToInitUser", (requestId: number) => {
            console.log(`sendToInitUser: ${requestId}`)
            this.socket.emit("initUserResponse", {
                requestId: requestId, characterData:
                    {nickname: player.name, characterId: player.id, characterType: "wanderer", roomId: this.roomId}
            });
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

    private initNewPlayer(char
                          :
                          Player
    ) {
        if (!entityManager.hasPlayer(char.id)) {
            if (player?.id !== char.id) {
                entityManager.addPlayer(char);
            } else {
                console.log("init myself")
            }
        } else {
            alert("player duplicate: " + char.id)
        }
    }

    public createRoom(id = "public")
        :
        void {
        this._socket.emit('createRoom', id);
    }

    public joinRoom(roomId
                    :
                    string, player
                    :
                    Player
    ):
        void {
        this.roomId = roomId;
        // alert(`player.id: ${player.id}`)
        this._socket.timeout(1000).emit("joinRoom", {
            nickname: player.name,
            characterId: player.id,
            characterType: "wanderer",
            roomId: roomId
        }, (err: any): void => {
            if (err) {
                alert("Ошибка подключения (" + err.toString() + ")")
            }
        })
    }

    public initUsers(player
                     :
                     Player
    ) {
        this._socket.timeout(3000).emit("initUsers", {
            nickname: player.name,
            characterId: player.id,
            characterType: "wanderer",
            roomId: this.roomId
        }, (err: any): void => {
            if (err) {
                alert("Ошибка инициализации игроков (" + err.toString() + ")")
            }
        })
    }

    public async initPeerConnection()
        :
        Promise<void> {
        const configuration = {
            iceServers: [
                {urls: 'stun:stun.l.google.com:19302'},
                {urls: 'turn:turn.viagenie.ca', username: 'webrtc@live.com', credential: 'webrtc'}
            ]
        };

        this.peerConnection = new RTCPeerConnection(configuration);


        if (this.peerConnection
        ) {
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

    public async createOffer()
        :
        Promise<void> {
        if (!
            this.peerConnection
        ) {
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

    public async handleOffer(offer
                             :
                             RTCSessionDescriptionInit
    ):
        Promise<void> {
        if (!
            this.peerConnection
        ) {
            await this.initPeerConnection();
        }

        if (this.peerConnection) {
            await this.peerConnection.setRemoteDescription(offer);

            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            if (this.roomId) {
                this._socket.emit('answer', answer, this.roomId);
            }
        }
    }


    public handleGameData(data
                          :
                          {
                              type: string, x
                                  :
                                  number, y
                                  :
                                  number
                          }
    ):
        void {
        switch (data.type
            ) {
            case
            'position'
            :
                this.updateRemotePlayerPosition(data.x, data.y);
                break;
        }
    }

    public updateRemotePlayerPosition(x
                                      :
                                      number, y
                                      :
                                      number
    ):
        void {
        console.log('Remote player position:', x, y);
    }

    public close() {
        if (this.peerConnection?.connectionState === "connected") {
            this.peerConnection?.close();
        }
        this.socket.disconnect();
    }
}

