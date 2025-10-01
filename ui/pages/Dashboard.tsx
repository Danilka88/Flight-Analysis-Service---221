/**
 * @file pages/Dashboard.tsx
 * @description Главная страница "Дашборд". Отображает ключевые метрики и визуализации.
 * 
 * BACKEND INTEGRATION:
 * - Эта страница получает все необходимые данные из Redux store.
 * - Данные в store загружаются единожды через `fetchData` thunk (см. `store/dataSlice.ts`).
 * - Бэкенд должен предоставить один эндпоинт, который вернет все данные, необходимые для
 *   заполнения всех компонентов на этой странице.
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchFlights, selectAltitudeDistribution } from '../store/flightsSlice';

import StatCard from '../components/StatCard';
import GeoMap from '../components/GeoMap';
import TimeSeriesChart from '../components/TimeSeriesChart';
import ActivityDistributionChart from '../components/ActivityDistributionChart';
import AIAnalysisModal from '../components/AIAnalysisModal';
import AnalyzeButton from '../components/AnalyzeButton';
import RegionBarChart from '../components/RegionBarChart';
import AltitudeChart from '../components/AltitudeChart';


// Icons
const GlobeAltIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 0 1-9-9 9 9 0 0 1 9-9m0 18a9 9 0 0 0 9-9 9 9 0 0 0-9-9m0 18v-9m0-9v9m0 0h9m-9 0H3" />
    </svg>
)

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
)

const BoltIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
)

const ChartPieIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
)

const ArrowTrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.28m5.94 2.28L21 2.25M3 18v-5.5m0 5.5h5.5" />
    </svg>
)


const Dashboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const data = useSelector((state: RootState) => state.data);
    const { status: dataStatus } = data;
    const { status: flightsStatus } = useSelector((state: RootState) => state.flights);
    const altitudeData = useSelector(selectAltitudeDistribution);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzingWidget, setAnalyzingWidget] = useState<string | null>(null);

    useEffect(() => {
        if (flightsStatus === 'idle') {
            dispatch(fetchFlights());
        }
    }, [flightsStatus, dispatch]);
    
    /**
     * @function handleAnalysisRequest
     * @description Обрабатывает запрос на AI-анализ для различных виджетов.
     * 
     * ### BACKEND INTEGRATION ###
     * Отправляет запрос на `POST /api/v1/ai/analyze`.
     * В теле запроса передается `widgetType` и соответствующие данные.
     * Бэкенд формирует промпт для LLM, получает ответ, санирует его
     * и возвращает в виде HTML-строки.
     * Подробную спецификацию см. в файле `API_INTEGRATION.md`.
     */
    const handleAnalysisRequest = async (widgetType: string) => {
        setAnalyzingWidget(widgetType);
        setIsAnalyzing(true);
        setIsModalOpen(true);
        setModalContent('');

        // Определяем данные и заголовок для отправки
        let analysisData: any;
        let title = 'AI-анализ';

        switch (widgetType) {
            case 'map':
                title = 'AI-анализ карты активности';
                analysisData = data.regions;
                break;
            case 'timeseries':
                title = 'AI-анализ динамики полетов';
                analysisData = data.timeSeries;
                break;
            case 'hourly':
                title = 'AI-анализ дневной активности';
                analysisData = data.hourlyDistribution;
                break;
            case 'totalFlights':
                title = 'AI-анализ: Всего полетов';
                analysisData = { totalFlights: data.totalFlights };
                break;
            case 'avgDuration':
                title = 'AI-анализ: Средняя длительность';
                analysisData = { avgFlightDuration: data.avgFlightDuration };
                break;
            case 'peakLoad':
                 title = 'AI-анализ: Пиковая нагрузка';
                 analysisData = { peakLoad: data.peakLoad };
                 break;
            case 'dailyDynamics':
                 title = 'AI-анализ: Среднесуточная динамика';
                 analysisData = { avgDailyFlights: data.avgDailyFlights, medianDailyFlights: data.medianDailyFlights };
                 break;
            case 'monthlyChange':
                 title = 'AI-анализ: Рост/падение за месяц';
                 analysisData = { monthlyChange: data.monthlyChange };
                 break;
            case 'zeroDays':
                 title = 'AI-анализ: Нулевые дни';
                 analysisData = { averageZeroDays: (data.regions.reduce((acc, r) => acc + r.zeroFlightDays, 0) / data.regions.length).toFixed(1) };
                 break;
            case 'regionBarChart':
                title = 'AI-анализ: Топ регионов';
                analysisData = data.regions;
                break;
            case 'altitudeChart':
                title = 'AI-анализ: Распределение по высотам';
                analysisData = altitudeData;
                break;
            default:
                analysisData = { info: 'Нет данных для анализа' };
        }

        setModalTitle(title);

        try {
            const response = await fetch('http://localhost:8000/api/v1/ai/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    widgetType: widgetType,
                    data: analysisData
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


    if (dataStatus === 'loading' || dataStatus === 'idle') {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-sky-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-lg text-gray-300">Загрузка данных...</p>
                </div>
            </div>
        );
    }
    
    if (dataStatus === 'failed') {
        return <div className="text-center text-red-500">Ошибка при загрузке данных.</div>;
    }

    return (
        <div className="space-y-6">
            <AIAnalysisModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalTitle}
                content={modalContent}
                isLoading={isAnalyzing}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 <StatCard 
                    title="Всего полетов" 
                    value={data.totalFlights.toLocaleString('ru-RU')}
                    icon={<GlobeAltIcon className="h-7 w-7"/>} 
                    description="Общее количество зафиксированных полетов"
                    onAnalyze={() => handleAnalysisRequest('totalFlights')}
                    isAnalyzing={isAnalyzing && analyzingWidget === 'totalFlights'}
                />
                <StatCard 
                    title="Средняя длительность" 
                    value={`${data.avgFlightDuration} мин.`} 
                    icon={<ClockIcon className="h-7 w-7" />}
                    description="Средняя продолжительность одного полета"
                    onAnalyze={() => handleAnalysisRequest('avgDuration')}
                    isAnalyzing={isAnalyzing && analyzingWidget === 'avgDuration'}
                />
                <StatCard 
                    title="Пиковая нагрузка (час)" 
                    value={`${data.peakLoad} полетов`} 
                    icon={<BoltIcon className="h-7 w-7" />}
                    description="Максимальное количество полетов за час"
                    onAnalyze={() => handleAnalysisRequest('peakLoad')}
                    isAnalyzing={isAnalyzing && analyzingWidget === 'peakLoad'}
                />
                <StatCard 
                    title="Среднесуточная динамика" 
                    value={`${data.avgDailyFlights} / ${data.medianDailyFlights}`} 
                    icon={<ChartPieIcon className="h-7 w-7" />}
                    description="Среднее / медианное кол-во полетов в сутки"
                    onAnalyze={() => handleAnalysisRequest('dailyDynamics')}
                    isAnalyzing={isAnalyzing && analyzingWidget === 'dailyDynamics'}
                />
                <StatCard 
                    title="Рост/падение за месяц" 
                    value={`${data.monthlyChange > 0 ? '+' : ''}${data.monthlyChange.toFixed(1)}%`}
                    icon={<ArrowTrendingUpIcon className="h-7 w-7" />}
                    description="Изменение числа полетов к прошлому месяцу"
                    onAnalyze={() => handleAnalysisRequest('monthlyChange')}
                    isAnalyzing={isAnalyzing && analyzingWidget === 'monthlyChange'}
                />
                 <StatCard 
                    title="Нулевые дни (в среднем)" 
                    value={ (data.regions.reduce((acc, r) => acc + r.zeroFlightDays, 0) / data.regions.length).toFixed(1)}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M12 14.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" /></svg>}
                    description="Среднее кол-во дней без полетов по регионам"
                    onAnalyze={() => handleAnalysisRequest('zeroDays')}
                    isAnalyzing={isAnalyzing && analyzingWidget === 'zeroDays'}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Карта активности полетов</h3>
                        <AnalyzeButton isLoading={isAnalyzing && analyzingWidget === 'map'} onClick={() => handleAnalysisRequest('map')} />
                    </div>
                    <GeoMap />
                </div>
                 <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Динамика полетов за 30 дней</h3>
                        <AnalyzeButton isLoading={isAnalyzing && analyzingWidget === 'timeseries'} onClick={() => handleAnalysisRequest('timeseries')} />
                    </div>
                    <TimeSeriesChart data={data.timeSeries} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col h-[450px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Топ регионов по активности</h3>
                        <AnalyzeButton isLoading={isAnalyzing && analyzingWidget === 'regionBarChart'} onClick={() => handleAnalysisRequest('regionBarChart')} />
                    </div>
                    <div className="flex-1">
                        <RegionBarChart data={data.regions} />
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col h-[450px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Распределение по высотам</h3>
                        <AnalyzeButton isLoading={isAnalyzing && analyzingWidget === 'altitudeChart'} onClick={() => handleAnalysisRequest('altitudeChart')} />
                    </div>
                    <div className="flex-1">
                        {flightsStatus === 'succeeded' ? (
                            <AltitudeChart data={altitudeData} />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Дневная активность (распределение по часам)</h3>
                    <AnalyzeButton isLoading={isAnalyzing && analyzingWidget === 'hourly'} onClick={() => handleAnalysisRequest('hourly')} />
                </div>
                <ActivityDistributionChart data={data.hourlyDistribution} />
            </div>
        </div>
    );
};

export default Dashboard;