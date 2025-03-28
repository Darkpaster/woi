import React, {useEffect, useRef, useState} from "react";
import {io, Socket} from "socket.io-client";
import {player} from "../../core/main.ts";
import {isMounted} from "../GameUI.tsx";
import {actions} from "../input/input.ts";
import {useMySelector} from "../../utils/stateManagement/store.ts";
import {UIState} from "../../utils/stateManagement/uiSlice.ts";

type messageType = {
    sender: string,
    content: string,
    type: 'DEFAULT' | 'ADMIN',
    roomId: 'public' | 'private'
}

const check = isMounted();

export const Chat: React.FC = () => {

    const [ws, setWs] = useState<null | Socket<never, never>>(null);
    const [messages, setMessages] = useState<messageType[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [username, setUsername] = useState(player?.name);

    const input = useRef<null | HTMLInputElement>(null);
    const enter = useRef<null | HTMLButtonElement>(null);


    useEffect(() => {

        if (check()) {
            return
        }

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

        const socket = io('http://localhost:8050/ws-chat', {
            withCredentials: true,
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socket.on('connect', () => {
            console.log('Socket connected successfully');
            console.log('Socket ID:', socket.id);
            setWs(socket);
        });

        socket.on('receiveMessage', (message: messageType) => {
            setMessages(prev => [...prev, message])
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        socket.connect();

        return () => {
            if (socket.connected) {
                socket.disconnect();
            }
        };

    }, []);

    const sendMessage = () => {
        if (ws && messageInput) {
            const chatMessage: messageType = {
                sender: username,
                content: messageInput,
                type: 'DEFAULT',
                roomId: 'public'
            };

            // @ts-ignore
            ws.timeout(2000).emit("sendMessage", chatMessage, (err: any): void => {
                if (err) {
                    alert("Ошибка отправки сообщения(")
                }
            })
            setMessageInput('');
        }
    };

    return (
        <div className="ui-div chat-div">
            <div>
                {messages.map((msg: messageType, index) => (
                    <span key={index}>
                                {
                                    `[${msg.roomId}] [`}
                        <b style={{color: "blue"}}>{msg.sender}</b>{
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
    );
};