import { useState, useEffect } from 'react';
import axios from 'axios';

// Базовая настройка для axios
const axiosInstance = axios.create({
    baseURL: 'https://api.example.com',  // Замените на ваш base URL
    timeout: 10000,                      // Таймаут запросов
});

const useApi = (url: string, method: string = 'GET', body = null, deps = []) => {
    const [data, setData] = useState(null);    // Данные ответа от API
    const [error, setError] = useState("");  // Ошибка при запросе
    const [loading, setLoading] = useState(true); // Статус загрузки

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const response = await axiosInstance({
                    method,
                    url,
                    data: body,
                });

                setData(response.data);  // Устанавливаем данные ответа
            } catch (err) {
                setError(typeof err === 'string' ? err : "");
            } finally {
                setLoading(false);  // Завершаем загрузку
            }
        };

        fetchData();
    }, [url, method, body, ...deps]);  // Перезапускать хук, если меняются параметры

    return { data, error, loading };
};
