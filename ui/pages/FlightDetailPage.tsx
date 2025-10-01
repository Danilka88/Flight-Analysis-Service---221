import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { fetchFlights } from '../store/flightsSlice';
import AIAnalysisModal from '../components/AIAnalysisModal';
import AnalyzeButton from '../components/AnalyzeButton';
import FlightPathMap from '../components/FlightPathMap';

const DataCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 flex flex-col">
        <h3 className="text-lg font-semibold text-sky-400 mb-4 border-b border-gray-700 pb-2">{title}</h3>
        {children}
    </div>
);

const DataRow: React.FC<{ label: string; value: React.ReactNode; isCode?: boolean }> = ({ label, value, isCode=false }) => (
    <div className="grid grid-cols-3 gap-4 py-2">
        <dt className="text-sm font-medium text-gray-400">{label}</dt>
        <dd className={`mt-1 text-sm text-white sm:mt-0 col-span-2 ${isCode ? 'font-mono bg-gray-900 p-2 rounded' : ''}`}>{value || 'Н/Д'}</dd>
    </div>
);


const FlightDetailPage: React.FC = () => {
    const { sid } = useParams<{ sid: string }>();
    const dispatch = useDispatch<AppDispatch>();

    const { allFlights, status } = useSelector((state: RootState) => state.flights);
    const flight = allFlights.find(f => f.parsed_data.SHR['Прочая информация'].SID === sid);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [modalContent, setModalContent] = useState('');

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchFlights());
        }
    }, [status, dispatch]);

    const handleAnalysisRequest = async () => {
        if (!flight) return;

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
                    widgetType: 'flightDetail',
                    data: flight
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

    if (status === 'loading' || status === 'idle') {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-sky-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-lg text-gray-300">Загрузка данных о полете...</p>
                </div>
            </div>
        );
    }

    if (!flight) {
        return (
            <div className="text-center text-red-400 p-8">
                <h2 className="text-2xl mb-4">Полет не найден</h2>
                <p>Не удалось найти полет с SID: {sid}</p>
                <Link to="/flights" className="mt-6 inline-block bg-sky-600 text-white font-bold py-2 px-4 rounded hover:bg-sky-700">
                    Вернуться к списку
                </Link>
            </div>
        );
    }
    
    const { parsed_data: data } = flight;

    return (
         <div className="space-y-6">
            <AIAnalysisModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`AI-анализ полета ${data.SHR['Прочая информация'].SID}`}
                content={modalContent}
                isLoading={isAnalyzing}
            />
            <div className="flex justify-between items-center">
                <div>
                    <Link to="/flights" className="text-sky-400 hover:text-sky-300 text-sm">&larr; Вернуться к списку</Link>
                    <h2 className="text-2xl font-bold text-white mt-1">Детали полета: <span className="font-mono text-sky-300">{sid}</span></h2>
                </div>
                <AnalyzeButton isLoading={isAnalyzing} onClick={handleAnalysisRequest} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DataCard title="Ключевая информация">
                     <dl className="divide-y divide-gray-700">
                        <DataRow label="Центр ЕС ОрВД" value={flight['Центр ЕС ОрВД']} />
                        <DataRow label="Дата полета" value={data.DEP?.date} />
                        <DataRow label="Длительность" value={data.flight_duration_minutes ? `${data.flight_duration_minutes} мин.` : 'Не завершен'} />
                        <DataRow label="Тип ВС" value={`${data.SHR['Прочая информация'].TYP.type} (x${data.SHR['Прочая информация'].TYP.count})`} />
                        <DataRow label="Оператор" value={data.SHR['Прочая информация'].OPR} />
                        <DataRow label="Рег. номера" value={data.SHR['Прочая информация'].REG?.join(', ')} />
                     </dl>
                </DataCard>
                <DataCard title="Вылет / Прилет">
                    <dl className="divide-y divide-gray-700">
                       <DataRow label="Время вылета (факт)" value={data.DEP?.time} isCode={true} />
                       <DataRow label="Координаты вылета" value={data.DEP ? `${data.DEP.coordinates.latitude.toFixed(4)}, ${data.DEP.coordinates.longitude.toFixed(4)}` : 'Н/Д'} isCode={true} />
                       <DataRow label="Время прилета (факт)" value={data.ARR?.time} isCode={true} />
                       <DataRow label="Координаты прилета" value={data.ARR ? `${data.ARR.coordinates.latitude.toFixed(4)}, ${data.ARR.coordinates.longitude.toFixed(4)}` : 'Н/Д'} isCode={true} />
                    </dl>
                </DataCard>
                 <DataCard title="Схема маршрута">
                    <FlightPathMap 
                        route={data.SHR.Маршрут}
                        depPoint={data.DEP}
                        arrPoint={data.ARR}
                    />
                </DataCard>
            </div>
            
            <DataCard title="RAW Телеграммы">
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-300">SHR (План полета)</h4>
                        <pre className="mt-1 p-3 bg-gray-900 rounded-md text-sm text-gray-300 overflow-x-auto">{flight.SHR_raw}</pre>
                    </div>
                     <div>
                        <h4 className="font-semibold text-gray-300">DEP (Вылет)</h4>
                        <pre className="mt-1 p-3 bg-gray-900 rounded-md text-sm text-gray-300 overflow-x-auto">{flight.DEP_raw || 'Нет данных'}</pre>
                    </div>
                     <div>
                        <h4 className="font-semibold text-gray-300">ARR (Прилет)</h4>
                        <pre className="mt-1 p-3 bg-gray-900 rounded-md text-sm text-gray-300 overflow-x-auto">{flight.ARR_raw || 'Нет данных'}</pre>
                    </div>
                </div>
            </DataCard>
        </div>
    );
};

export default FlightDetailPage;