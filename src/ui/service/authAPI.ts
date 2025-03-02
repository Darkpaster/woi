import { useState, useEffect } from 'react';
import axios from 'axios';

// Базовая настройка для axios
const axiosInstance = axios.create({
    baseURL: 'https://localhost',  // Замените на ваш base URL
    timeout: 10000,                      // Таймаут запросов
});

type apiProps = {
    url?: string,
    method?: "GET" | "POST" | "FETCH" | "DELETE" | "PUT",
    body?: string|null,
    deps?: never[]
}

const useAuthAPI = ({url, method = 'GET', body = null, deps = []}: apiProps) => {
    const [data, setData] = useState<string|null>(null);    // Данные ответа от API
    const [error, setError] = useState<string|unknown|null>("");  // Ошибка при запросе
    const [loading, setLoading] = useState<boolean>(true); // Статус загрузки

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
                setError(err);
            } finally {
                setLoading(false);  // Завершаем загрузку
            }
        };

        fetchData();
    }, [url, method, body, ...deps]);  // Перезапускать хук, если меняются параметры

    return { data, error, loading };
};

export default useAuthAPI;