import React, {useEffect, useState} from 'react';
import {useCookies} from "react-cookie";
import UseAuthAPI from "../../../service/hooks/authAPI.ts";
import "../styles/auth.scss"

type props = {
    onLogin: () => void;
}


const Auth: React.FC<props> = ({onLogin}: props) => {
    // const user = useMySelector((state: { auth: AuthState }) => state.auth.user);
    // const error = useMySelector((state: { auth: AuthState }) => state.auth.error);

    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const [lever, setLever] = useState(false); //триггер

    const [successful, setSuccessful] = useState("");


    function requestType(): { url: string, method: 'POST' | 'GET', body: {username: string, email?: string, password: string} } {
        if (mode === 'login') {
            return {
                url: "/login",
                method: "POST",
                body: {
                    username: username,
                    password: password
                },
            }
        } else {
            return {
                url: "/register",
                method: "POST",
                body: {
                    username: username,
                    email: email,
                    password: password
                },
            }
        }
    }

    const [cookies, setCookie] = useCookies(['session_active'])

    const {data, error, loading, clear} = UseAuthAPI({
        ...requestType(),
        onLoad: (response) => {
            if (response) {
                if (mode === "login") {
                    const expires = new Date();
                    expires.setTime(expires.getTime() + (60 * 60 * 1000)); //1h
                    setCookie('session_active', true, {path: '/', expires});
                    // setAuthHeader(`Bearer ${response}`)
                    onLogin();
                } else {
                    setUsername("");
                    setPassword("");
                    setEmail("");
                    setSuccessful("Аккаунт зарегистрирован");
                }
            }
        },
        deps: [lever],
    });

    const handleSwitchMode = (mode: 'login'|'register')=> {
        setMode(mode);
        clear();
        setSuccessful("");
    }

    const handleSubmit = (e: React.FormEvent) => {
        if (loading) {
            return
        }

        e.preventDefault();
        setLever(!lever);
    };

    return (
        <div className={"ui-div auth-div ui-border"}>
            <h2>
                <center>{mode === 'login' ? 'Вход' : 'Регистрация'}</center>
            </h2>
            <hr></hr>
            <form onSubmit={handleSubmit}>

                <div>
                    <label htmlFor="username">Username:</label>
                    <input className={"ui-div"}
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                {mode === "register" && (<div>
                    <label htmlFor="email">Email:</label>
                    <input className={"ui-div"}
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>)}
                <div>
                    <label htmlFor="password">Пароль:</label>
                    <input className={"ui-div"}
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className={"ui-div"} type="submit" disabled={false}>
                    {(mode === 'login' ? 'Войти' : 'Зарегистрироваться')}
                </button>
                {error && <p style={{color: "red"}}>Ошибка: {error.toString()}</p>}
                {loading && <p style={{color: "yellow"}}>Загрузка...</p>}
                {successful && <p style={{color: "green"}}>{successful}</p>}
            </form>
            <div style={{marginTop: '1rem'}}>
                {mode === 'login' ? (
                    <p>
                        Нет аккаунта?
                        <button className={"ui-div"} onClick={() => handleSwitchMode('register')} disabled={false}>
                            {"Зарегистрироваться"}
                        </button>
                    </p>
                ) : (
                    <p>
                        Уже есть аккаунт?
                        <button className={"ui-div"} onClick={() => handleSwitchMode('login')} disabled={false}>
                            Войти
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Auth;
