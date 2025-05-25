import React, {ReactElement, useEffect, useRef, useState} from "react";
import {io, Socket} from "socket.io-client";
import {entityManager, gameRTC, initWS, player} from "../../../../core/main.ts";
import {isMounted} from "../../../game/GameUI.tsx";
import {actions} from "../../../input/input.ts";
import MessageBubble from "./MessageBubble.tsx";
import "../styles/chat.scss"

export type messageType = {
    senderId: number,
    sender: string,
    content: string,
    type: 'DEFAULT' | 'ADMIN' | 'SYSTEM',
    roomId: 'global' | 'private'
}

const check = isMounted();

const Chat: React.FC = () => {

    const [ws, setWs] = useState<null | Socket<never, never>>(null);
    const [messages, setMessages] = useState<messageType[]>([]);
    const [bubbles, setBubbles] = useState<Map<number, string>>(new Map());
    const [messageInput, setMessageInput] = useState('');
    const [username, setUsername] = useState(player?.name);

    const input = useRef<null | HTMLInputElement>(null);
    const enter = useRef<null | HTMLButtonElement>(null);


    useEffect(() => {

        if (check()) {
            return
        }

        initWS();

        actions.enter = (event) => {
            event.preventDefault();
            if (document.activeElement !== input.current) {
                input.current!.focus();
            }
        }

        input.current?.addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                enter.current?.click();
                document.getElementById("canvas")!.focus();
            }
        });


        setWs(gameRTC.socket);

        gameRTC.socket.on("receiveMessage", (msg: messageType) => {
            setMessages(prev => [...prev, msg]);
            if (msg.type === "DEFAULT") {
                setBubbles(prev => prev.set(msg.senderId, msg.content))
                setTimeout(() => setBubbles(prev => prev.set(msg.senderId, "")), Math.sqrt(msg.content.length) * 500 + 1500);
            } else {
                console.log("no default message found");
                // если покинул сервер то надо удалить из entitiesManager
            }
        })

        return () => {
            if (gameRTC.socket.connected) {
                gameRTC.close();
            }
        }

    }, []);

    const sendMessage = () => {
        if (ws && messageInput) {
            const chatMessage: messageType = {
                senderId: player?.id,
                sender: username,
                content: messageInput,
                type: 'DEFAULT',
                roomId: 'global'
            };

            // @ts-ignore
            ws.timeout(2000).emit("sendMessage", chatMessage, (err: any): void => {
                if (err) {
                    // alert("Ошибка отправки сообщения(")
                }
            })
            setMessageInput('');
        }
    };

    return (
        <>
            <div className="ui-div chat-div">
                <div>
                    {messages.map((msg: messageType, index) => (
                        <span key={index}>
                                {
                                    `[${msg.roomId}] [`}
                            <b style={{color: "lightblue"}}>{msg.sender}</b>{
                            `]: ${msg.content}`
                        }
                            </span>
                    ))}
                </div>
                <input className={"ui-div"} id={"chat-input"} ref={input}
                       value={messageInput}
                       onChange={(e) => setMessageInput(e.target.value)}
                       placeholder="Type a message"
                />
                <button style={{display: "none"}} onClick={sendMessage} ref={enter}></button>
            </div>

            { Array.from(bubbles).map(([key, value]) => value && (<MessageBubble key={`bubble${key}`} msg={value} playerId={key}></MessageBubble>) )}
        </>

    );
};

export default Chat;