import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchFlights } from '../store/flightsSlice';
import GeoMap from '../components/GeoMap';
import AIAnalysisModal from '../components/AIAnalysisModal';
import AnalyzeButton from '../components/AnalyzeButton';

const FullMapPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { regions, status } = useSelector((state: RootState) => state.data);
    const { status: flightsStatus } = useSelector((state: RootState) => state.flights);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [modalContent, setModalContent] = useState('');

    useEffect(() => {
        if (flightsStatus === 'idle') {
            dispatch(fetchFlights());
        }
    }, [flightsStatus, dispatch]);

    const handleAnalysisRequest = async () => {
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
                    widgetType: 'fullMap',
                    data: regions
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
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-sky-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-lg text-gray-300">Загрузка данных карты...</p>
                </div>
            </div>
        );
    }
    
    if (status === 'failed') {
        return <div className="text-center text-red-500">Ошибка при загрузке данных.</div>;
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 h-full flex flex-col">
            <AIAnalysisModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="AI-анализ карты активности"
                content={modalContent}
                isLoading={isAnalyzing}
            />
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-xl font-semibold text-white">Интерактивная карта активности</h2>
                <AnalyzeButton isLoading={isAnalyzing} onClick={handleAnalysisRequest} />
            </div>
            <div className="flex-1 min-h-0">
                <GeoMap />
            </div>
        </div>
    );
};

export default FullMapPage;
