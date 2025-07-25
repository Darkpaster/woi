import {useState, useEffect, useRef} from 'react';
import axios from 'axios';

const axiosAuth = axios.create({
    baseURL: '/player',
    timeout: 10000,
    withCredentials: true
});


type apiProps = {
    url?: string,
    method?: "GET" | "POST" | "FETCH" | "DELETE" | "PUT",
    body?: any,
    onLoad: (data: any) => void,
    deps?: any[]
}
//rewrite this module
const UseInitAPI = ({url, method = 'GET', body = null, onLoad = () => alert("default!"), deps = []}: apiProps) => {
    const isMounted = useIsMount();
    const [data, setData] = useState<any|null>(null);
    const [error, setError] = useState<string|null>("");
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        // if (isMounted) {
        //     return
        // }
        const fetchData = async () => new Promise(async (resolve, reject) => {
            setLoading(true);

            try {
                const response = await axiosAuth({
                    method,
                    url,
                    data: body,
                    withCredentials: true
                });

                setData(response.data);
                resolve(response.data);
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

    return { data, error, loading };
};


export const useIsMount = () => {
    const isMountRef = useRef(true);
    useEffect(() => {
        isMountRef.current = false;
    }, []);
    return isMountRef.current;
};

export default UseInitAPI;