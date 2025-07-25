// authAPI.ts - CODE REVIEW COMMENTS

import {useState, useEffect, useRef} from 'react';
import axios from 'axios';

// ISSUE 1: Глобальная конфигурация axios без типизации
const axiosAuth = axios.create({
    baseURL: '/auth',
    timeout: 10000,
    withCredentials: true,
});

// ISSUE 2: Утилитарная функция в файле хука
// ❌ Проблема: Нарушение принципа единственной ответственности
function getCookieValue(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// ISSUE 3: Неиспользуемая функция
// ❌ Проблема: Мертвый код, который не используется
async function initCSRF() {
    try {
        await axios.get('/csrf', { withCredentials: true });
    } catch (error) {
        console.error('Failed to get CSRF token', error);
    }
}

// ISSUE 4: Закомментированный код без объяснения
// Много закомментированного кода для CSRF и authorization headers

// SUGGESTIONS FOR IMPROVEMENT:
// 1. Вынести утилиты в отдельные файлы
// 2. Добавить типизацию для всех параметров
// 3. Улучшить обработку ошибок
// 4. Создать отдельные хуки для разных API операций

// ISSUE 5: Слабая типизация props
type apiProps = {
    url?: string,
    method?: "GET" | "POST" | "FETCH" | "DELETE" | "PUT", // FETCH не HTTP метод
    body?: any, // any - плохая практика
    onLoad: (data: any) => void, // any - плохая практика
    deps?: any[] // any[] - плохая практика
}

// ISSUE 6: Закомментированные функции без объяснения
// export function setAuthHeader(data: string) {
//     axiosAuth.defaults.headers.common["Authorization"] = data;
// }

// export function deleteAuthHeader() {
//     delete axiosAuth.defaults.headers.common["Authorization"];
// }

// export function hasAuthHeader() {
//     return axiosAuth.defaults.headers.common["Authorization"];
// }

// ISSUE 7: Неправильные default значения и naming
const UseAuthAPI = ({
                        url,
                        method = 'GET',
                        body = null,
                        onLoad = () => alert("default!"), // ❌ alert в default функции
                        deps = []
                    }: apiProps) => {
    // ISSUE 8: Использование кастомного хука внутри другого хука
    const isMounted = useIsMount();

    // ISSUE 9: Инициализация состояний с any
    const [data, setData] = useState<any|null>(null);
    const [error, setError] = useState<string|null>("");
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        // ISSUE 10: Логика с isMounted в useEffect
        if (isMounted) {
            return
        }

        // ISSUE 11: Создание Promise внутри useEffect без необходимости
        const fetchData = async () => new Promise(async (resolve, reject) => {
            setLoading(true);

            try {
                const response = await axiosAuth({
                    method,
                    url,
                    data: body,
                    withCredentials: true
                });

                const resData = JSON.parse(response.data);
                setData(resData);
                resolve(resData);
            } catch (err) {
                if (err.response && err.response.data) {
                    setError(JSON.stringify(err.response.data.message));
                } else {
                    setError(err.message || "Ошибка запроса");
                }
                reject("error!")
            } finally {
                setLoading(false);
            }
        });

        const result = fetchData();
        result.then((resolve) => {
            onLoad(resolve);
        }, (reject) => {
        });
    }, [...deps]);

    const clear = () => {
        setError("");
    }

    return { data, error, loading, clear };
};


export const useIsMount = () => {
    const isMountRef = useRef(true);
    useEffect(() => {
        isMountRef.current = false;
    }, []);
    return isMountRef.current;
};

export default UseAuthAPI;