import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { selectFilteredAndSortedFlights, setFilter, setSort, setCurrentPage, fetchFlights } from '../store/flightsSlice';
import Pagination from '../components/Pagination';
import AnalyzeButton from '../components/AnalyzeButton';
import AIAnalysisModal from '../components/AIAnalysisModal';

const SortIcon: React.FC<{ direction?: 'asc' | 'desc' }> = ({ direction }) => {
    if (!direction) return <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>;
    if (direction === 'asc') return <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>;
    return <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;
};

const FlightsListPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { pagination, sorting, filters, status } = useSelector((state: RootState) => state.flights);
    const flights = useSelector(selectFilteredAndSortedFlights);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [modalContent, setModalContent] = useState('');

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchFlights());
        }
    }, [status, dispatch]);

    const totalPages = Math.ceil(flights.length / pagination.itemsPerPage);
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    const currentFlights = flights.slice(startIndex, endIndex);

    const handleAnalysisRequest = async () => {
        if (!flights.length) return;

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
                    widgetType: 'flightsList',
                    data: flights // Отправляем отфильтрованный список
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
                    <p className="mt-4 text-lg text-gray-300">Загрузка списка полетов...</p>
                </div>
            </div>
        );
    }
    
    if (status === 'failed') {
        return <div className="text-center text-red-500">Ошибка при загрузке данных о полетах.</div>;
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <AIAnalysisModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="AI-анализ списка полетов"
                content={modalContent}
                isLoading={isAnalyzing}
            />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                 <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-white">Список полетов ({flights.length})</h2>
                    <AnalyzeButton isLoading={isAnalyzing} onClick={handleAnalysisRequest} />
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex-1">
                    <label htmlFor="atc-filter" className="block text-sm font-medium text-gray-300 mb-1">Центр ЕС ОрВД</label>
                    <input
                        type="text"
                        id="atc-filter"
                        value={filters.atcCenter}
                        onChange={(e) => dispatch(setFilter({ filterName: 'atcCenter', value: e.target.value }))}
                        placeholder="Название центра..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>
                <div className="flex-1">
                    <label htmlFor="sid-filter" className="block text-sm font-medium text-gray-300 mb-1">SID</label>
                    <input
                        type="text"
                        id="sid-filter"
                        value={filters.sid}
                        onChange={(e) => dispatch(setFilter({ filterName: 'sid', value: e.target.value }))}
                        placeholder="Идентификатор..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-900 rounded-lg">
                    <thead>
                        <tr className="bg-gray-700">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">SID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => dispatch(setSort({ key: 'atc' }))}>
                                <div className="flex items-center">Центр ЕС ОрВД <SortIcon direction={sorting.key === 'atc' ? sorting.direction : undefined} /></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => dispatch(setSort({ key: 'date' }))}>
                                <div className="flex items-center">Дата <SortIcon direction={sorting.key === 'date' ? sorting.direction : undefined} /></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Время вылета/прилета</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => dispatch(setSort({ key: 'duration' }))}>
                                <div className="flex items-center">Длительность <SortIcon direction={sorting.key === 'duration' ? sorting.direction : undefined} /></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Тип ВС</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {currentFlights.map((flight) => (
                            <tr key={flight.parsed_data.SHR['Прочая информация'].SID} className="hover:bg-gray-800 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">{flight.parsed_data.SHR['Прочая информация'].SID}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{flight['Центр ЕС ОрВД']}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{flight.parsed_data.DEP?.date || 'Н/Д'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">{flight.parsed_data.DEP?.time || '--:--'} / {flight.parsed_data.ARR?.time || '--:--'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{flight.parsed_data.flight_duration_minutes !== null ? `${flight.parsed_data.flight_duration_minutes} мин` : 'Н/Д'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{flight.parsed_data.SHR['Прочая информация'].TYP.type} ({flight.parsed_data.SHR['Прочая информация'].TYP.count})</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/flights/${flight.parsed_data.SHR['Прочая информация'].SID}`} className="text-sky-400 hover:text-sky-300">
                                        Детали
                                    </Link>
                                </td>
                            </tr>
                        ))}
                         {flights.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-gray-400">
                                    Нет полетов, соответствующих вашим фильтрам.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
             {totalPages > 1 && (
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => dispatch(setCurrentPage(page))}
                />
            )}
        </div>
    );
};

export default FlightsListPage;