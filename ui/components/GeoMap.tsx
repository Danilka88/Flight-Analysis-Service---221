import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { FeatureCollection } from 'geojson';

const GeoMap: React.FC = () => {
    const [geoData, setGeoData] = useState<FeatureCollection | null>(null); 
    const [maxFlights, setMaxFlights] = useState<number>(0); // Новое состояние для максимального количества полетов
    const [hoveredRegion, setHoveredRegion] = useState<any>(null); // Состояние для наведенного региона

    useEffect(() => {
        const fetchGeoData = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/geo/regions');
                if (!response.ok) {
                    throw new Error('Failed to fetch geo data');
                }
                const data: FeatureCollection = await response.json();
                setGeoData(data);

                // Вычисляем максимальное количество полетов для динамической раскраски
                const currentMaxFlights = Math.max(...data.features.map(f => f.properties?.flight_count || 0), 0);
                setMaxFlights(currentMaxFlights);

            } catch (error) {
                console.error("Error fetching geo data:", error);
            }
        };

        fetchGeoData();
    }, []);

    const getRegionColor = (flightCount: number) => {
        if (flightCount === 0) return '#374151'; // bg-gray-700 for no data

        // Динамическая раскраска на основе maxFlights
        const intensity = maxFlights > 0 ? flightCount / maxFlights : 0;

        if (intensity > 0.8) return '#38bdf8'; // sky-400
        if (intensity > 0.6) return '#0ea5e9'; // sky-500
        if (intensity > 0.4) return '#0284c7'; // sky-600
        if (intensity > 0.2) return '#0369a1'; // sky-700
        return '#075985'; // sky-800 (для очень малого количества полетов, но больше 0)
    };

    const style = (feature: any) => {
        const flightCount = feature.properties.flight_count || 0;
        const hasFlights = feature.properties.has_flights || false;

        return {
            fillColor: getRegionColor(flightCount),
            weight: hasFlights ? 1 : 0.5,
            opacity: 1,
            color: hasFlights ? 'white' : '#6b7280', // gray-500
            dashArray: hasFlights ? '3' : '',
            fillOpacity: hasFlights ? 0.7 : 0.2
        };
    };

    // Обработчики событий для наведения
    const onEachFeature = (feature: any, layer: any) => {
        layer.on({
            mouseover: (e: any) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 3,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.9
                });
                layer.bringToFront();
                setHoveredRegion(feature.properties); // Сохраняем свойства наведенного региона
            },
            mouseout: (e: any) => {
                // Возвращаем стиль по умолчанию
                e.target.setStyle(style(feature));
                setHoveredRegion(null); // Сбрасываем наведенный регион
            },
            click: (e: any) => {
                // Можно добавить логику по клику, например, зум к региону
                console.log('Clicked on region:', feature.properties.region_name);
            }
        });
    };

    if (!geoData) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-sky-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-lg text-gray-300">Загрузка карты...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            <MapContainer center={[60, 100]} zoom={3} style={{ height: '100%', width: '100%' }} attributionControl={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <GeoJSON data={geoData} style={style} onEachFeature={onEachFeature} />
            </MapContainer>
            {hoveredRegion && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '5px',
                        zIndex: 1000,
                        pointerEvents: 'none' // Чтобы не перехватывать события мыши
                    }}
                >
                    <h3>{hoveredRegion.original_name}</h3>
                    <p>Количество полетов: {hoveredRegion.flight_count}</p>
                </div>
            )}
        </div>
    );
};

export default GeoMap;