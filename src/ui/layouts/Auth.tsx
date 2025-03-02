import React, {useEffect, useState} from 'react';
import {AuthState, loginUser, registerUser} from '../../utils/stateManagement/authSlice';
import {useMyDispatch, useMySelector} from "../../utils/stateManagement/store.ts";

type props = {
    onLogin: () => void;
}


const Auth: React.FC<props> = ({onLogin}:props) => {
    const dispatch = useMyDispatch();
    const user = useMySelector((state: { auth: AuthState }) => state.auth.user);
    const error = useMySelector((state: { auth: AuthState }) => state.auth.error);

    const [mode, setMode] = useState<'login' | 'register'>('login');
    // const [username, setUsername] = useState('');
    const [email, setEmail] = useState(''); // для регистрации
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'login') {
            dispatch(loginUser({ email, password }));
        } else {
            dispatch(registerUser({ email, password }));
        }
    };

    useEffect(() => {
        if (user) {
            onLogin();
        }
    }, [user]);

    return (
        <div className="ui-div auth-div">
            <h2><center>{mode === 'login' ? 'Вход' : 'Регистрация'}</center></h2>
            <hr></hr>
            {error && <div className="error">{error}</div>}
            {user ? (
                <div >
                    <p>Добро пожаловать, {user.email}!</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {/*{mode === 'register' && (*/}

                    {/*)}*/}
                    <div>
                        <label htmlFor="email">Email:</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Пароль:</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="ui-div" type="submit" disabled={false}>
                        {false ? (mode === 'login' ? 'Вход...' : 'Регистрация...') : (mode === 'login' ? 'Войти' : 'Зарегистрироваться')}
                    </button>
                </form>
            )}
            <div style={{ marginTop: '1rem' }}>
                {mode === 'login' ? (
                    <p>
                        Нет аккаунта?{' '}
                        <button className="ui-div" onClick={() => setMode('register')} disabled={false}>
                            Зарегистрироваться
                        </button>
                    </p>
                ) : (
                    <p>
                        Уже есть аккаунт?{' '}
                        <button className="ui-div" onClick={() => setMode('login')} disabled={false}>
                            Войти
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Auth;
