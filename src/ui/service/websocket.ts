// services/websocket.ts
import { useEffect, useState } from 'react';

export function useWebSocket(url: string) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Создаем WebSocket-соединение
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.onmessage = (event: MessageEvent) => {
            setMessages((prevMessages) => [...prevMessages, event.data]);
        };

        ws.onerror = (event: Event) => {
            setError('WebSocket error');
            console.error('WebSocket error:', event);
        };

        ws.onclose = (event: CloseEvent) => {
            console.log('WebSocket connection closed', event);
        };

        // Очистка при размонтировании компонента
        return () => {
            ws.close();
        };
    }, [url]);

    // Функция для отправки сообщений через WebSocket
    const sendMessage = (message: string) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(message);
        } else {
            setError('WebSocket is not connected');
        }
    };

    return { socket, messages, error, sendMessage };
}
