/**
 * @file components/InteractiveMap.tsx
 * @description Компонент для визуализации активности полетов по регионам в виде интерактивной карты.
 * 
 * BACKEND INTEGRATION:
 * - Компонент ожидает на вход массив объектов `RegionData`.
 * - Каждый объект должен содержать `name`, `flights`, `avgDuration`, `change` для тултипа
 *   и `coords` для позиционирования.
 * - Расчеты радиуса и цвета "пузыря" происходят на фронтенде, но основаны на значении `flights`.
 */
import React, { useState } from 'react';
import { RegionData } from '../types';

/**
 * @interface InteractiveMapProps
 * @description Пропсы для компонента InteractiveMap.
 */
interface InteractiveMapProps {
    /**
     * @property {RegionData[]} data - Массив данных по регионам, полученный от бэкенда.
     */
    data: RegionData[];
}

interface TooltipData {
    x: number;
    y: number;
    name: string;
    flights: number;
    avgDuration: number;
    change: number;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ data }) => {
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);

    if (!data || data.length === 0) {
        return <div className="flex-1 flex items-center justify-center"><p className="text-gray-400">Нет данных для отображения карты.</p></div>;
    }

    const maxFlights = Math.max(...data.map(d => d.flights), 0);

    const getRadius = (flights: number) => {
        if (maxFlights === 0) return 5;
        return 5 + (flights / maxFlights) * 20; // Scale radius from 5 to 25
    };

    const getColor = (flights: number) => {
        if (maxFlights === 0) return 'fill-sky-700';
        const intensity = flights / maxFlights;
        if (intensity > 0.8) return 'fill-sky-400';
        if (intensity > 0.5) return 'fill-sky-500';
        if (intensity > 0.2) return 'fill-sky-600';
        return 'fill-sky-700';
    };

    const handleMouseEnter = (region: RegionData) => {
        setTooltip({
            x: region.coords.x,
            y: region.coords.y,
            name: region.name,
            flights: region.flights,
            avgDuration: region.avgDuration,
            change: region.change,
        });
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };
    
    // Условный контур карты России для фона
    const backgroundPath = "M850,50 L950,150 L900,300 L750,550 L400,580 L150,500 L50,300 L100,100 L300,20 L600,10 Z";

    return (
        <div className="relative w-full flex-1" onMouseLeave={handleMouseLeave}>
            <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
                <path d={backgroundPath} fill="#1F2937" stroke="#4B5563" strokeWidth="2" />
                {data.map(region => (
                    <circle
                        key={region.id}
                        cx={region.coords.x}
                        cy={region.coords.y}
                        r={getRadius(region.flights)}
                        className={`${getColor(region.flights)} opacity-70 cursor-pointer transition-all duration-300 hover:opacity-100 hover:stroke-white`}
                        strokeWidth="2"
                        onMouseEnter={() => handleMouseEnter(region)}
                    />
                ))}
            </svg>
            {tooltip && (
                <div
                    className="absolute bg-gradient-to-br from-gray-900 via-gray-800 to-gray-800 text-white p-4 rounded-lg shadow-2xl border border-sky-500/20 pointer-events-none w-60 transition-all duration-200"
                    style={{
                        left: `${(tooltip.x / 1000) * 100}%`,
                        top: `${(tooltip.y / 600) * 100}%`,
                        transform: 'translate(-50%, -120%)',
                        opacity: 1,
                    }}
                >
                    <p className="font-bold text-lg mb-3 border-b border-gray-700 pb-2 text-sky-300">{tooltip.name}</p>
                    <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                            <span className="flex items-center text-sm text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                Полеты
                            </span>
                            <span className="font-bold text-xl text-sky-400">{tooltip.flights.toLocaleString('ru-RU')}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="flex items-center text-sm text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Ср. длительность
                            </span>
                            <span className="font-bold text-xl text-amber-300">
                                {tooltip.avgDuration}
                                <span className="text-xs font-medium text-gray-400 ml-1">мин.</span>
                            </span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="flex items-center text-sm text-gray-400">
                                 {tooltip.change >= 0 ? 
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> : 
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                                }
                                Динамика
                            </span>
                            <span className={`font-bold text-lg ${tooltip.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {tooltip.change >= 0 ? `+${tooltip.change}` : tooltip.change}%
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteractiveMap;
