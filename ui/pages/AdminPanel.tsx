import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { resetFlightsData } from '../store/flightsSlice'; // Импортируем новый reducer

const AdminPanel: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const handleResetData = () => {
        if (window.confirm('Вы уверены, что хотите сбросить все данные о полетах? Это действие необратимо.')) {
            dispatch(resetFlightsData());
            alert('Данные о полетах сброшены.');
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Панель администратора</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900 p-4 rounded-lg">
                    <h3 className="font-semibold text-sky-400 mb-2">Управление пользователями</h3>
                    <p className="text-sm text-gray-400">Здесь будет интерфейс для добавления, редактирования и удаления пользователей системы.</p>
                     <button className="mt-4 bg-sky-600 text-white text-sm font-semibold py-2 px-3 rounded-md hover:bg-sky-700 transition-colors">
                        Перейти к управлению
                    </button>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                    <h3 className="font-semibold text-sky-400 mb-2">Обновление геоданных</h3>
                    {/*
                      * @see /API_INTEGRATION.md#5-геоданные-картография
                      * Этот раздел является макетом. План по реализации полноценной ГИС
                      * с использованием GeoJSON описан в документации по интеграции API.
                      */}
                    <p className="text-sm text-gray-400">Интерфейс для загрузки и обновления shape-файлов или GeoJSON данных для карты регионов.</p>
                    <button className="mt-4 bg-sky-600 text-white text-sm font-semibold py-2 px-3 rounded-md hover:bg-sky-700 transition-colors">
                        Загрузить файлы
                    </button>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                    <h3 className="font-semibold text-sky-400 mb-2">Системный мониторинг</h3>
                    <p className="text-sm text-gray-400">Просмотр системных логов, статуса сервисов и интеграция с системами мониторинга.</p>
                     <button className="mt-4 bg-sky-600 text-white text-sm font-semibold py-2 px-3 rounded-md hover:bg-sky-700 transition-colors">
                        Открыть логи
                    </button>
                </div>
                 <div className="bg-gray-900 p-4 rounded-lg">
                    <h3 className="font-semibold text-sky-400 mb-2">Настройки системы</h3>
                    <p className="text-sm text-gray-400">Конфигурация параметров обработки данных, пороговых значений и уведомлений.</p>
                     <button className="mt-4 bg-sky-600 text-white text-sm font-semibold py-2 px-3 rounded-md hover:bg-sky-700 transition-colors">
                        Изменить настройки
                    </button>
                </div>
                {/* Новая секция для сброса данных */}
                <div className="bg-gray-900 p-4 rounded-lg col-span-full">
                    <h3 className="font-semibold text-red-400 mb-2">Сброс данных о полетах</h3>
                    <p className="text-sm text-gray-400">Полностью очищает все загруженные данные о полетах из системы и локального хранилища.</p>
                    <button 
                        onClick={handleResetData} 
                        className="mt-4 bg-red-600 text-white text-sm font-semibold py-2 px-3 rounded-md hover:bg-red-700 transition-colors"
                    >
                        Сбросить все данные
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;