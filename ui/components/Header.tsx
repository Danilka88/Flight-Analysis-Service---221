import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { logout, toggleRole } from '../store/userSlice';
import { UserRole } from '../types';

const pageTitles: { [key: string]: string } = {
    '/dashboard': 'Аналитический дашборд',
    '/map': 'Карта активности полетов',
    '/flights': 'Список полетов',
    '/regions': 'Анализ по регионам',
    '/altitudes': 'Анализ по высотам',
    '/reports': 'Отчеты и выгрузки',
    '/upload': 'Загрузка пакетов данных',
    '/admin': 'Панель администратора',
};

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);

const SwitchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
);


const Header: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { role, username } = useSelector((state: RootState) => state.user);
    const location = useLocation();
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    let title = pageTitles[location.pathname] || 'Система Анализа Полетов';
    if (location.pathname.startsWith('/flights/')) {
        title = 'Детали полета';
    }
    
    const handleLogout = () => {
        dispatch(logout());
        navigate('/login', { replace: true });
    };

    const handleRoleChange = () => {
        dispatch(toggleRole());
        setDropdownOpen(false);
    };

    return (
        <header className="flex items-center justify-between h-20 px-6 bg-gray-900 border-b border-gray-700">
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            <div className="relative">
                <button 
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                    onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                    className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                >
                    <UserIcon className="h-8 w-8 text-gray-400 bg-gray-900 rounded-full p-1" />
                    <div className="text-left hidden md:block">
                        <p className="font-semibold text-white text-sm capitalize">{username}</p>
                        <p className="text-xs text-gray-400">{role === UserRole.ADMIN ? 'Администратор' : 'Оператор'}</p>
                    </div>
                    <svg className={`fill-current h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/> </svg>
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg z-10 border border-gray-700 animate-fade-in-down" role="menu">
                        <div className="py-1">
                            {username?.toLowerCase() === 'admin' && (
                                <button 
                                    onClick={handleRoleChange} 
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                    role="menuitem"
                                >
                                    <SwitchIcon className="h-5 w-5 mr-3" />
                                    <span>Сменить режим</span>
                                </button>
                            )}
                            <button 
                                onClick={handleLogout} 
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                                role="menuitem"
                            >
                                <LogoutIcon className="h-5 w-5 mr-3" />
                                <span>Выйти</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.2s ease-out forwards; }
            `}</style>
        </header>
    );
};

export default Header;