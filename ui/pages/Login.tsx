import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '../store/store';
import { loginSuccess } from '../store/userSlice';

const WrenchScrewdriverIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.664 1.208-.766M11.42 15.17l-4.66-4.66" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 5.25-8.25 8.25L6 18.75l-5.25-5.25L6 8.25l8.25-8.25L19.5 5.25Z" />
    </svg>
)

const Login: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (username.trim() === '' || password.trim() === '') {
            setError('Имя пользователя и пароль не могут быть пустыми.');
            return;
        }

        // ### BACKEND INTEGRATION ###
        // В реальном приложении здесь будет вызов API:
        // `POST /api/v1/auth/login` с `username` и `password`.
        // Подробности см. в файле `API_INTEGRATION.md`.
        dispatch(loginSuccess(username));
        navigate('/dashboard', { replace: true });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
                <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <WrenchScrewdriverIcon className="h-10 w-10 text-sky-400" />
                        <span className="ml-4 text-2xl font-bold text-white">Анализ Полетов</span>
                    </div>
                    <h2 className="text-xl text-gray-300">Вход в систему</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">Имя пользователя</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 rounded-t-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                                placeholder="Имя пользователя"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password-input" className="sr-only">Пароль</label>
                            <input
                                id="password-input"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 rounded-b-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md">
                           <p className="text-sm text-red-300 text-center">{error}</p>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500 transition-colors"
                        >
                            Войти
                        </button>
                    </div>
                     <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-700/50">
                        <p>Для демонстрации используйте любые данные.</p>
                        <p>Для входа с правами администратора введите имя <strong className="text-gray-400">admin</strong>.</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
