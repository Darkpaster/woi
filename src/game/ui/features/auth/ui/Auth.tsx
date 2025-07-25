// Auth.tsx - CODE REVIEW COMMENTS

import React, {useEffect, useState} from 'react';
import {useCookies} from "react-cookie";
import UseAuthAPI from "../api/authAPI.ts";
import "../styles/auth.scss"

// ISSUE 1: Типы props без документации
type props = {
    onLogin: () => void;
}

// SUGGESTIONS FOR IMPROVEMENT:
// 1. Переименовать Props с заглавной буквы
// 2. Добавить JSDoc комментарии
// 3. Добавить обработку ошибок
// 4. Вынести форму в отдельный компонент
// 5. Добавить валидацию полей

const Auth: React.FC<props> = ({onLogin}: props) => {
    // ISSUE 2: Закомментированный код без объяснения
    // const user = useMySelector((state: { auth: AuthState }) => state.auth.user);
    // const error = useMySelector((state: { auth: AuthState }) => state.auth.error);

    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    // ISSUE 3: Неописательное название переменной
    // ❌ Проблема: lever не объясняет назначение переменной
    const [lever, setLever] = useState(false); //триггер

    const [successful, setSuccessful] = useState("");

    // ISSUE 4: Сложная функция с множественной ответственностью
    function requestType(): { url: string, method: 'POST' | 'GET', body: {username: string, email?: string, password: string} } {
        if (mode === 'login') {
            return {
                url: "/login",
                method: "POST", // ISSUE 5: Всегда POST, зачем указывать GET в типе?
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

    // ISSUE 6: Использование кастомного хука с сложной логикой
    const {data, error, loading, clear} = UseAuthAPI({
        ...requestType(),
        onLoad: (response) => {
            if (response) {
                if (mode === "login") {
                    // ISSUE 7: Магическое число без константы
                    const expires = new Date();
                    expires.setTime(expires.getTime() + (60 * 60 * 1000)); //1h
                    setCookie('session_active', true, {path: '/', expires});

                    // ISSUE 8: Закомментированный код
                    // setAuthHeader(`Bearer ${response}`)
                    onLogin();
                } else {
                    // ISSUE 9: Сброс формы вручную - можно автоматизировать
                    setUsername("");
                    setPassword("");
                    setEmail("");
                    setSuccessful("Аккаунт зарегистрирован");
                }
            }
        },
        deps: [lever], // ISSUE 10: Непонятная зависимость
    });

    // ISSUE 11: Функция делает слишком много действий
    const handleSwitchMode = (mode: 'login'|'register')=> {
        setMode(mode);
        clear();
        setSuccessful("");
    }

    const handleSubmit = (e: React.FormEvent) => {
        // ISSUE 12: Ранний возврат без сообщения пользователю
        if (loading) {
            return
        }

        e.preventDefault();
        setLever(!lever); // ISSUE 13: Странный способ триггера запроса
    };

    return (
        <div className={"ui-div auth-div ui-border"}>
            <h2>
                {/* ISSUE 14: Устаревший тег center */}
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
                        // ISSUE 15: Отсутствует валидация и accessibility атрибуты
                    />
                </div>

                {/* ISSUE 16: Условный рендеринг без мемоизации */}
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
                        // ISSUE 17: Нет минимальной длины пароля
                    />
                </div>

                {/* ISSUE 18: disabled={false} - бессмысленный атрибут */}
                <button className={"ui-div"} type="submit" disabled={false}>
                    {(mode === 'login' ? 'Войти' : 'Зарегистрироваться')}
                </button>

                {/* ISSUE 19: Отображение ошибки как строки без обработки */}
                {error && <p style={{color: "red"}}>Ошибка: {error.toString()}</p>}
                {loading && <p style={{color: "yellow"}}>Загрузка...</p>}
                {successful && <p style={{color: "green"}}>{successful}</p>}
            </form>

            <div style={{marginTop: '1rem'}}>
                {mode === 'login' ? (
                    <p>
                        Нет аккаунта?
                        {/* ISSUE 20: Повторение disabled={false} */}
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

// РЕКОМЕНДАЦИИ ПО РЕФАКТОРИНГУ:
/*
1. Создать отдельные компоненты для форм:
   - LoginForm
   - RegisterForm

2. Добавить валидацию полей:
   const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
   const validatePassword = (password: string) => password.length >= 8;

3. Использовать react-hook-form для управления формой:
   const { register, handleSubmit, formState: { errors } } = useForm();

4. Создать константы для сообщений:
   const MESSAGES = {
     LOGIN_SUCCESS: 'Успешный вход',
     REGISTER_SUCCESS: 'Аккаунт зарегистрирован',
     // ...
   };

5. Добавить loading состояние для кнопки:
   <button disabled={loading} type="submit">
     {loading ? <Spinner /> : buttonText}
   </button>

6. Вынести логику cookie в отдельный хук:
   const useAuthCookie = () => {
     const [cookies, setCookie] = useCookies(['session_active']);
     const setSessionCookie = () => {
       const expires = new Date(Date.now() + HOUR_IN_MS);
       setCookie('session_active', true, { path: '/', expires });
     };
     return { setSessionCookie };
   };

7. Добавить типы для API ответов:
   interface LoginResponse {
     token: string;
     user: User;
   }

8. Использовать CSS модули вместо строковых классов:
   import styles from './Auth.module.scss';

9. Добавить accessibility атрибуты:
   aria-label, aria-describedby, role

10. Создать enum для режимов:
    enum AuthMode {
      LOGIN = 'login',
      REGISTER = 'register'
    }
*/