/**
 * @file pages/Reports.tsx
 * @description Страница "Отчеты". Отображает данные в виде таблицы с возможностью фильтрации и экспорта.
 * 
 * BACKEND INTEGRATION:
 * - Данные для таблицы (`regions`) берутся из эндпоинта `GET /api/v1/analytics/summary`.
 * - Для больших наборов данных бэкенд должен поддерживать фильтрацию через query-параметры.
 *   Например: `GET /api/v1/analytics/summary?name=Москва&min_flights=500`.
 * - Подробности см. в файле `API_INTEGRATION.md`.
 */
import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import AIAnalysisModal from '../components/AIAnalysisModal';
import AnalyzeButton from '../components/AnalyzeButton';

const Reports: React.FC = () => {
    const { regions, status } = useSelector((state: RootState) => state.data);
    const [regionFilter, setRegionFilter] = useState('');
    const [minFlightsFilter, setMinFlightsFilter] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const filteredRegions = useMemo(() => {
        return regions.filter(region => {
            const regionNameMatch = region.name.toLowerCase().includes(regionFilter.toLowerCase());
            const flightsMatch = minFlightsFilter === '' || region.flights >= parseInt(minFlightsFilter, 10);
            return regionNameMatch && flightsMatch;
        });
    }, [regions, regionFilter, minFlightsFilter]);
    
    /**
     * @function handleAnalysisRequest
     * @description Запрашивает AI-анализ для отфильтрованных данных таблицы.
     * 
     * ### BACKEND INTEGRATION ###
     * Отправляет запрос на `POST /api/v1/ai/analyze` с `widgetType: "report"`
     * и массивом отфильтрованных `RegionData`.
     * Подробности см. в `API_INTEGRATION.md`.
     */
    const handleAnalysisRequest = async () => {
        if (!filteredRegions.length) return;

        setIsAnalyzing(true);
        setIsModalOpen(true);
        setModalContent('');

        try {
            const response = await fetch('http://localhost:8000/api/v1/ai/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    widgetType: 'report',
                    data: filteredRegions
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setModalContent(result.analysis);

        } catch (error) { 
            console.error("Ошибка при запросе AI-анализа:", error);
            setModalContent('<p>Не удалось получить анализ от сервера. Пожалуйста, проверьте консоль.</p>');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleExportJSON = () => {
        const dataToExport = filteredRegions;
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'flight_report.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };
    
    const handleExportPNG = () => {
        alert("Функционал экспорта в PNG находится в разработке.");
    };


    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <AIAnalysisModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="AI-анализ сводного отчета"
                content={modalContent}
                isLoading={isAnalyzing}
            />

            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                 <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-white">Сводный отчет по регионам</h2>
                    <AnalyzeButton isLoading={isAnalyzing} onClick={handleAnalysisRequest} />
                </div>
                <div className="space-x-3 flex-shrink-0">
                    <button onClick={handleExportJSON} className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-700 transition-colors">
                        Экспорт в JSON
                    </button>
                    <button onClick={handleExportPNG} className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                        Экспорт в PNG
                    </button>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex-1">
                    <label htmlFor="region-filter" className="block text-sm font-medium text-gray-300 mb-1">
                        Фильтр по названию региона
                    </label>
                    <input
                        type="text"
                        id="region-filter"
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                        placeholder="Введите название..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        aria-label="Фильтр по названию региона"
                    />
                </div>
                <div className="flex-1">
                    <label htmlFor="flights-filter" className="block text-sm font-medium text-gray-300 mb-1">
                        Минимальное количество полетов
                    </label>
                    <input
                        type="number"
                        id="flights-filter"
                        value={minFlightsFilter}
                        onChange={(e) => setMinFlightsFilter(e.target.value)}
                        placeholder="Например, 500"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        aria-label="Минимальное количество полетов"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-900 rounded-lg">
                    <thead>
                        <tr className="bg-gray-700">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Регион</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Кол-во полетов</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Плотность (полеты/1000 км²)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Площадь (км²)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Нулевые дни</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ср. длительность (мин)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Динамика (%)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {status === 'loading' && (
                            <tr><td colSpan={7} className="text-center py-4 text-gray-400">Загрузка данных...</td></tr>
                        )}
                        {status === 'succeeded' && filteredRegions.map((region) => (
                            <tr key={region.id} className="hover:bg-gray-800 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{region.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{region.flights.toLocaleString('ru-RU')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{region.flightDensity.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{region.area.toLocaleString('ru-RU')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{region.zeroFlightDays}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{region.avgDuration}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${region.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {region.change >= 0 ? `+${region.change}` : region.change}%
                                </td>
                            </tr>
                        ))}
                         {status === 'succeeded' && filteredRegions.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-gray-400">
                                    Нет данных, соответствующих вашим фильтрам.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;
