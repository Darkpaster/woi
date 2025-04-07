import {useState, useEffect, useRef} from 'react';
import axios from 'axios';

const axiosAuth = axios.create({
    baseURL: '/auth',
    timeout: 10000,
    withCredentials: true,
});

// Функция для получения значения cookie
function getCookieValue(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Функция для инициализации CSRF
async function initCSRF() {
    try {
        // Этот запрос установит XSRF-TOKEN cookie
        await axios.get('/csrf', { withCredentials: true });
    } catch (error) {
        console.error('Failed to get CSRF token', error);
    }
}

// Вызовите эту функцию при загрузке приложения
// initCSRF();

// После этого добавляйте токен в заголовки запросов
// axiosAuth.interceptors.request.use(config => {
//     const token = getCookieValue('XSRF-TOKEN');
//     if (token) {
//         config.headers['X-XSRF-TOKEN'] = token;
//     }
//     return config;
// });

type apiProps = {
    url?: string,
    method?: "GET" | "POST" | "FETCH" | "DELETE" | "PUT",
    body?: any,
    onLoad: (data: any) => void,
    deps?: any[]
}

// export function setAuthHeader(data: string) {
//     axiosAuth.defaults.headers.common["Authorization"] = data;
// }

// export function deleteAuthHeader() {
//     delete axiosAuth.defaults.headers.common["Authorization"];
// }

// export function hasAuthHeader() {
//     return axiosAuth.defaults.headers.common["Authorization"];
// }

const UseAuthAPI = ({url, method = 'GET', body = null, onLoad = () => alert("default!"), deps = []}: apiProps) => {
    const isMounted = useIsMount();
    const [data, setData] = useState<any|null>(null);
    const [error, setError] = useState<string|null>("");
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (isMounted) {
            return
        }
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