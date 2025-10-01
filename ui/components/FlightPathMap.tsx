import React, { useMemo } from 'react';

// Импортируем типы из центрального файла
interface Coordinates {
    latitude: number;
    longitude: number;
}
interface ParsedRoute {
    altitude: { min_m: number; max_m: number } | null;
    zona: { type: string; [key: string]: any } | null;
    waypoints: any[];
    raw: string;
}
interface PointData {
    coordinates: Coordinates;
}

interface FlightPathMapProps {
    route: ParsedRoute;
    depPoint: PointData | null;
    arrPoint: PointData | null;
}

const FlightPathMap: React.FC<FlightPathMapProps> = ({ route, depPoint, arrPoint }) => {
    
    const viewBox = { width: 100, height: 100, padding: 10 };

    const memoizedData = useMemo(() => {
        const allPoints: Coordinates[] = [];
        if (depPoint) allPoints.push(depPoint.coordinates);
        if (arrPoint) allPoints.push(arrPoint.coordinates);

        if (route.zona?.type === 'polygon' && route.zona.coordinates) {
            allPoints.push(...route.zona.coordinates);
        } else if (route.zona?.type === 'radius' && route.zona.center) {
            allPoints.push(route.zona.center);
        }

        if (allPoints.length === 0) {
            return null;
        }

        const latitudes = allPoints.map(p => p.latitude);
        const longitudes = allPoints.map(p => p.longitude);

        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLon = Math.min(...longitudes);
        const maxLon = Math.max(...longitudes);
        
        const latRange = maxLat - minLat || 1;
        const lonRange = maxLon - minLon || 1;
        
        const scale = Math.min(
            (viewBox.width - viewBox.padding * 2) / lonRange,
            (viewBox.height - viewBox.padding * 2) / latRange
        );

        const transformCoords = (coords: Coordinates) => {
            const x = viewBox.padding + ((coords.longitude - minLon) / lonRange) * (viewBox.width - viewBox.padding * 2);
            const y = viewBox.padding + ((maxLat - coords.latitude) / latRange) * (viewBox.height - viewBox.padding * 2);
            return { x, y };
        };

        const dep = depPoint ? transformCoords(depPoint.coordinates) : null;
        const arr = arrPoint ? transformCoords(arrPoint.coordinates) : null;

        let zoneElement = null;
        if (route.zona?.type === 'polygon' && route.zona.coordinates) {
            const points = route.zona.coordinates.map(transformCoords).map(p => `${p.x},${p.y}`).join(' ');
            zoneElement = <polygon points={points} className="fill-sky-500/20 stroke-sky-400" strokeWidth="0.5" />;
        } else if (route.zona?.type === 'radius' && route.zona.center) {
            const center = transformCoords(route.zona.center);
            // Приблизительный расчет радиуса в единицах viewBox
            const radiusInDegrees = route.zona.radius_km / 111.32; // Очень грубое преобразование км в градусы
            const radius = radiusInDegrees * scale;
            zoneElement = <circle cx={center.x} cy={center.y} r={radius} className="fill-sky-500/20 stroke-sky-400" strokeWidth="0.5" />;
        }

        return { dep, arr, zoneElement };

    }, [route, depPoint, arrPoint]);

    if (!memoizedData) {
        return (
            <div className="flex-1 flex items-center justify-center h-full text-center text-sm text-gray-400">
                <p>Визуализация маршрута недоступна.<br/>(Нет координатных данных для зоны или точек маршрута)</p>
            </div>
        );
    }
    
    const { dep, arr, zoneElement } = memoizedData;

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 w-full h-full border border-gray-700 rounded-md bg-gray-900/50">
                <svg width="100%" height="100%" viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}>
                    {zoneElement}
                    {dep && arr && (
                        <line x1={dep.x} y1={dep.y} x2={arr.x} y2={arr.y} className="stroke-lime-400" strokeWidth="0.7" strokeDasharray="2 1" />
                    )}
                    {dep && (
                        <>
                            <circle cx={dep.x} cy={dep.y} r="1.5" className="fill-green-400" />
                            <text x={dep.x + 2} y={dep.y} className="fill-gray-300 text-[3px] font-sans">Старт</text>
                        </>
                    )}
                     {arr && (
                        <>
                            <circle cx={arr.x} cy={arr.y} r="1.5" className="fill-red-400" />
                            <text x={arr.x + 2} y={arr.y} className="fill-gray-300 text-[3px] font-sans">Финиш</text>
                        </>
                     )}
                </svg>
            </div>
             <div className="flex-shrink-0 text-xs text-gray-400 mt-2 flex items-center justify-center space-x-4">
                <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-sky-500/20 border border-sky-400 mr-1.5"></div>Зона полета</div>
                <div className="flex items-center"><div className="w-3 h-0.5 bg-lime-400 mr-1.5"></div>Маршрут</div>
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-400 mr-1.5"></div>Старт</div>
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-400 mr-1.5"></div>Финиш</div>
            </div>
        </div>
    );
};

export default FlightPathMap;
