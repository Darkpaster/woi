import React, {useEffect, useState} from "react";
import {getLogHistory, Message} from "../../core/logic/logs.ts";

export const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const logHistory = getLogHistory();
            setMessages([...logHistory]);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="ui-div chat-div">
            {messages.map((msg, index) => (
                <span key={index} style={{ color: msg.color, display: 'block' }}>
          {msg.author}
                    {msg.content}
        </span>
            ))}
            {/*<input className="ui-div" />*/}
        </div>
    );
};