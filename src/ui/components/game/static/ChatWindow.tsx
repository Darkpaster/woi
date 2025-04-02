import React, {ReactElement, useEffect, useRef, useState} from "react";
import {io, Socket} from "socket.io-client";
import {entityManager, gameRTC, initWS, player} from "../../../../core/main.ts";
import {isMounted} from "../../../GameUI.tsx";
import {actions} from "../../../input/input.ts";
import {MessageBubble} from "../dynamic/MessageBubble.tsx";

export type messageType = {
    playerID: number,
    sender: string,
    content: string,
    type: 'DEFAULT' | 'ADMIN',
    roomId: 'public' | 'private'
}

const check = isMounted();

export const ChatWindow: React.FC = () => {

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
            setBubbles(prev => prev.set(msg.playerID, msg.content))
            setTimeout(() => setBubbles(prev => prev.set(msg.playerID, "")), Math.sqrt(msg.content.length) * 500 + 1500);
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
                playerID: player?.id,
                sender: username,
                content: messageInput,
                type: 'DEFAULT',
                roomId: 'public'
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

            { Array.from(bubbles).map(([key, value]) => value && (<MessageBubble key={`bubble${key}`} msg={value} playerID={key}></MessageBubble>) )}
        </>

    );
};