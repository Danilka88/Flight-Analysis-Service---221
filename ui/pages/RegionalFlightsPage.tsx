import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { 
    fetchFlights, 
    selectFlightsForRegion,
    selectAircraftTypesForRegion,
    selectHourlyDistributionForRegion,
    selectAltitudeDistributionForRegion
} from '../store/flightsSlice';
import Pagination from '../components/Pagination';
import AnalyzeButton from '../components/AnalyzeButton';
import AIAnalysisModal from '../components/AIAnalysisModal';
import AircraftTypePieChart from '../components/AircraftTypePieChart';
import ActivityDistributionChart from '../components/ActivityDistributionChart';
import AltitudeChart from '../components/AltitudeChart';


const RegionalFlightsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { allFlights, status } = useSelector((state: RootState) => state.flights);
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [modalContent, setModalContent] = useState('');
    
    const flightsForSelectedRegion = useSelector((state: RootState) => selectFlightsForRegion(state, selectedRegion));
    const aircraftTypesData = useSelector((state: RootState) => selectAircraftTypesForRegion(state, selectedRegion));
    const hourlyData = useSelector((state: RootState) => selectHourlyDistributionForRegion(state, selectedRegion));
    const altitudeData = useSelector((state: RootState) => selectAltitudeDistributionForRegion(state, selectedRegion));


    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchFlights());
        }
    }, [status, dispatch]);

    const regions = useMemo(() => {
        if (!allFlights.length) return [];
        const regionSet = new Set(allFlights.map(flight => flight['Центр ЕС ОрВД']));
        return Array.from(regionSet).sort();
    }, [allFlights]);

    useEffect(() => {
        if (regions.length > 0 && !selectedRegion) {
            setSelectedRegion(regions[0]);
        }
    }, [regions, selectedRegion]);


    const regionStats = useMemo(() => {
        if (!flightsForSelectedRegion.length) return { totalFlights: 0, avgDuration: 0 };
        const totalFlights = flightsForSelectedRegion.length;
        const totalDuration = flightsForSelectedRegion.reduce((acc, flight) => {
            return acc + (flight.parsed_data.flight_duration_minutes || 0);
        }, 0);
        const avgDuration = totalFlights > 0 ? Math.round(totalDuration / totalFlights) : 0;
        return { totalFlights, avgDuration };
    }, [flightsForSelectedRegion]);

    const totalPages = Math.ceil(flightsForSelectedRegion.length / itemsPerPage);
    const paginatedFlights = flightsForSelectedRegion.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSelectRegion = (region: string) => {
        setSelectedRegion(region);
        setCurrentPage(1);
    }

    const handleAnalysisRequest = async () => {
        if (!selectedRegion || !regionStats) return;

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
                    widgetType: 'regionalFlights',
                    data: {
                        regionName: selectedRegion,
                        stats: regionStats,
                        aircraftTypes: aircraftTypesData,
                        hourlyDistribution: hourlyData,
                        altitudeDistribution: altitudeData,
                        flights: flightsForSelectedRegion.slice(0, 5) // Отправляем первые 5 для примера
                    }
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
                <svg className="animate-spin h-10 w-10 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    return (
        <div className="flex h-full gap-6">
             <AIAnalysisModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`AI-анализ: ${selectedRegion}`}
                content={modalContent}
                isLoading={isAnalyzing}
            />
            <div className="w-1/4 bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col">
                <h2 className="text-lg font-semibold text-white mb-4">Регионы</h2>
                <div className="flex-1 overflow-y-auto">
                    <ul className="space-y-2">
                        {regions.map(region => (
                            <li key={region}>
                                <button
                                    onClick={() => handleSelectRegion(region)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                        selectedRegion === region ? 'bg-sky-600 text-white font-semibold' : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    {region}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="w-3/4 overflow-y-auto pr-2">
                {selectedRegion ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-700 sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-white">Аналитика: {selectedRegion}</h2>
                            <AnalyzeButton isLoading={isAnalyzing} onClick={handleAnalysisRequest} />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <p className="text-sm text-gray-400">Всего полетов</p>
                                <p className="text-3xl font-bold text-white">{regionStats.totalFlights.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <p className="text-sm text-gray-400">Средняя длительность</p>
                                <p className="text-3xl font-bold text-white">{regionStats.avgDuration} <span className="text-lg">мин.</span></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-[300px] flex flex-col">
                                <h3 className="text-md font-semibold text-white mb-2">Типы ВС</h3>
                                <div className="flex-1">
                                    <AircraftTypePieChart data={aircraftTypesData} />
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-[300px] flex flex-col">
                                <h3 className="text-md font-semibold text-white mb-2">Дневная активность</h3>
                                <div className="flex-1">
                                    <ActivityDistributionChart data={hourlyData} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-[350px] flex flex-col">
                            <h3 className="text-md font-semibold text-white mb-2">Распределение по высотам</h3>
                            <div className="flex-1">
                                <AltitudeChart data={altitudeData} />
                            </div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Список полетов ({flightsForSelectedRegion.length})</h3>
                            <div className="overflow-x-auto">
                               <table className="min-w-full bg-gray-900/50 rounded-t-lg">
                                    <thead>
                                        <tr className="bg-gray-700/50">
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">SID</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Дата</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Длительность</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Тип ВС</th>
                                            <th className="px-4 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700/50">
                                        {paginatedFlights.map(flight => (
                                            <tr key={flight.parsed_data.SHR['Прочая информация'].SID} className="hover:bg-gray-800/50">
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-mono text-gray-400">{flight.parsed_data.SHR['Прочая информация'].SID}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{flight.parsed_data.DEP?.date || 'Н/Д'}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{flight.parsed_data.flight_duration_minutes ? `${flight.parsed_data.flight_duration_minutes} мин.` : 'Н/Д'}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{flight.parsed_data.SHR['Прочая информация'].TYP.type}</td>
                                                <td className="px-4 py-2 text-right">
                                                    <Link to={`/flights/${flight.parsed_data.SHR['Прочая информация'].SID}`} className="text-sky-400 hover:text-sky-300 text-sm">Детали</Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {totalPages > 1 && (
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-center">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                            <h3 className="mt-2 text-lg font-medium text-white">Выберите регион</h3>
                            <p className="mt-1 text-sm text-gray-400">Выберите регион из списка слева, чтобы просмотреть детальную информацию.</p>
                        </div>
                    </div>
                )}
            </div>
             <style>{`
                .pr-2:hover::-webkit-scrollbar {
                    width: 8px;
                }
                .pr-2::-webkit-scrollbar {
                    width: 8px;
                    background-color: transparent;
                }
                 .pr-2::-webkit-scrollbar-thumb {
                    background-color: #4A5568;
                    border-radius: 4px;
                }
                 .pr-2::-webkit-scrollbar-thumb:hover {
                    background-color: #718096;
                }
            `}</style>
        </div>
    );
};

export default RegionalFlightsPage;