import { RegionData, TimeSeriesData, HourlyData } from '../types';

export const MOCK_REGIONS: RegionData[] = [
    { id: 'MSK', name: 'Москва и область', flights: 1250, avgDuration: 45, change: 12, coords: { x: 250, y: 300 }, area: 44900, zeroFlightDays: 0, flightDensity: 0 },
    { id: 'SPB', name: 'Санкт-Петербург и область', flights: 980, avgDuration: 52, change: 8, coords: { x: 200, y: 220 }, area: 85900, zeroFlightDays: 0, flightDensity: 0 },
    { id: 'KRD', name: 'Краснодарский край', flights: 760, avgDuration: 75, change: -5, coords: { x: 270, y: 450 }, area: 75500, zeroFlightDays: 1, flightDensity: 0 },
    { id: 'SVE', name: 'Свердловская область', flights: 650, avgDuration: 60, change: 15, coords: { x: 450, y: 280 }, area: 194300, zeroFlightDays: 2, flightDensity: 0 },
    { id: 'NVS', name: 'Новосибирская область', flights: 540, avgDuration: 55, change: 3, coords: { x: 630, y: 310 }, area: 177800, zeroFlightDays: 1, flightDensity: 0 },
    { id: 'TAT', name: 'Республика Татарстан', flights: 480, avgDuration: 65, change: -2, coords: { x: 350, y: 290 }, area: 67800, zeroFlightDays: 3, flightDensity: 0 },
    { id: 'CHE', name: 'Челябинская область', flights: 410, avgDuration: 48, change: 22, coords: { x: 460, y: 330 }, area: 88500, zeroFlightDays: 2, flightDensity: 0 },
    { id: 'ROS', name: 'Ростовская область', flights: 380, avgDuration: 70, change: 10, coords: { x: 280, y: 400 }, area: 101000, zeroFlightDays: 4, flightDensity: 0 },
    { id: 'SAM', name: 'Самарская область', flights: 320, avgDuration: 58, change: -8, coords: { x: 360, y: 350 }, area: 53600, zeroFlightDays: 5, flightDensity: 0 },
    { id: 'PRI', name: 'Приморский край', flights: 290, avgDuration: 85, change: 18, coords: { x: 950, y: 480 }, area: 164700, zeroFlightDays: 6, flightDensity: 0 },
    { id: 'KHA', name: 'Хабаровский край', flights: 250, avgDuration: 90, change: 5, coords: { x: 970, y: 380 }, area: 787600, zeroFlightDays: 7, flightDensity: 0 },
    { id: 'ARK', name: 'Архангельская область', flights: 150, avgDuration: 120, change: 1, coords: { x: 280, y: 150 }, area: 589900, zeroFlightDays: 10, flightDensity: 0 },
];

export const MOCK_TIME_SERIES: TimeSeriesData[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
        date: date.toLocaleDateString('ru-RU'),
        flights: Math.floor(Math.random() * 200) + 100 + i * 5,
    };
});

// Mock data for hourly flight distribution
export const MOCK_HOURLY_DATA: HourlyData[] = [
    { hour: '00', flights: 5 }, { hour: '01', flights: 2 }, { hour: '02', flights: 1 }, { hour: '03', flights: 3 },
    { hour: '04', flights: 4 }, { hour: '05', flights: 8 }, { hour: '06', flights: 15 }, { hour: '07', flights: 25 },
    { hour: '08', flights: 40 }, { hour: '09', flights: 55 }, { hour: '10', flights: 68 }, { hour: '11', flights: 75 },
    { hour: '12', flights: 80 }, { hour: '13', flights: 82 }, { hour: '14', flights: 78 }, { hour: '15', flights: 70 },
    { hour: '16', flights: 65 }, { hour: '17', flights: 60 }, { hour: '18', flights: 50 }, { hour: '19', flights: 42 },
    { hour: '20', flights: 35 }, { hour: '21', flights: 28 }, { hour: '22', flights: 18 }, { hour: '23', flights: 10 },
];