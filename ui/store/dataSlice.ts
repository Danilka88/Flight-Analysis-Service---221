import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataState, Flight, RegionData, TimeSeriesData, HourlyData } from '../types';
import { fetchFlights } from './flightsSlice';

// Utility function to standardize region names (обновленная версия)
const standardizeRegionName = (name: string): string => {
  if (!name) return '';
  let standardized = name.toLowerCase();
  
  // Удаляем общие суффиксы и слова
  standardized = standardized.replace(/(область|край|республика|автономный округ|ао|г\.)/g, '');
  standardized = standardized.replace(/(ый|ая|ий|ое|ые|овский|ский|ская|ская)/g, ''); // Удаляем окончания
  standardized = standardized.replace(/[^а-я0-9\s-]/g, ''); // Удаляем все, кроме кириллицы, цифр, пробелов и дефисов
  standardized = standardized.replace(/\s+/g, ' ').trim(); // Удаляем лишние пробелы

  // Специальные случаи маппинга
  const mapping: { [key: string]: string } = {
      "санкт-петербург": "санкт-петербург",
      "рост": "ростовская",
      "новосибир": "новосибирская",
      "моск": "московская",
      "екатеринбург": "свердловская",
      "якут": "саха якутия",
      "симферополь": "крым",
      "карачаево-черкес": "карачаево-черкесия",
      "северная осетия - алани": "северная осетия - алания",
      "ханты-мансийский - югр": "ханты-мансийский - югра",
      "еврейская автономна": "еврейская автономная",
      "забайкальск": "забайкальский",
      "приморск": "приморский",
      "камчатск": "камчатский",
      "хабаровск": "хабаровский",
      "магаданск": "магаданская",
      "иркутск": "иркутская",
      "тюменск": "тюменская",
      "самарск": "самарская",
      "калининградск": "калининградская",
      "краснодарск": "краснодарский",
      "красноярск": "красноярский",
      "мурманск": "мурманская",
      "новосибирск": "новосибирская",
      "оренбургск": "оренбургская",
      "пензенск": "пензенская",
      "пермск": "пермский",
      "псковск": "псковская",
      "рязанск": "рязанская",
      "саратовск": "саратовская",
      "сахалинск": "сахалинская",
      "смоленск": "смоленская",
      "ставропольск": "ставропольский",
      "тамбовск": "тамбовская",
      "тверск": "тверская",
      "томск": "томская",
      "тульск": "тульская",
      "ульяновск": "ульяновская",
      "чукотск": "чукотский",
      "волгоградск": "волгоградская",
      "вологодск": "вологодская",
      "воронежск": "воронежская",
      "ярославск": "ярославская",
      "белгородск": "белгородская",
      "кировск": "кировская",
      "липецк": "липецкая",
      "нижегородск": "нижегородская",
      "новгородск": "новгородская",
      "омск": "омская",
      "орловск": "орловская",
      "амурск": "амурская",
      "адыге": "адыгея",
      "алтайск": "алтайский",
      "башкортостан": "башкортостан",
      "бурят": "бурятия",
      "калмыки": "калмыкия",
      "карели": "карелия",
      "коми": "коми",
      "крым": "крым",
      "марий эл": "марий эл",
      "москва": "москва",
      "севастополь": "севастополь",
      "татарстан": "татарстан",
      "тыва": "тыва",
      "удмуртия": "удмуртия",
      "чечен": "чечня",
      "чуваш": "чувашия",
      "сумск": "сумска",
      "алтай": "алтай",
      "еврейская автономная": "еврейская автономная",
      "ханты-мансийский - югра": "ханты-мансийский - югра",
      "северная осетия - алания": "северная осетия - алания"
  };
  
  for (const key in mapping) {
      if (standardized.startsWith(key)) {
          return mapping[key];
      }
  }

  return standardized;
};

const initialState: DataState = {
  regions: [],
  timeSeries: [],
  hourlyDistribution: [],
  totalFlights: 0,
  avgFlightDuration: 0,
  peakLoad: 0,
  avgDailyFlights: 0,
  medianDailyFlights: 0,
  monthlyChange: 0,
  status: 'idle',
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlights.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFlights.fulfilled, (state, action: PayloadAction<Flight[]>) => {
        const flights = action.payload;
        if (!flights || flights.length === 0) {
          state.status = 'succeeded';
          return;
        }

        // --- CALCULATIONS BASED ON FLIGHTS DATA ---
        state.totalFlights = flights.length;

        const totalDuration = flights.reduce((sum, f) => sum + (f.parsed_data.flight_duration_minutes || 0), 0);
        state.avgFlightDuration = state.totalFlights > 0 ? Math.round(totalDuration / state.totalFlights) : 0;

        const hourly: HourlyData[] = Array.from({ length: 24 }, (_, i) => ({
            hour: i.toString().padStart(2, '0'),
            flights: 0,
        }));
        flights.forEach(f => {
          if (f.parsed_data.DEP?.time) {
            const hour = parseInt(f.parsed_data.DEP.time.substring(0, 2), 10);
            if (!isNaN(hour) && hour >= 0 && hour < 24) {
              hourly[hour].flights++;
            }
          }
        });
        state.hourlyDistribution = hourly;
        state.peakLoad = Math.max(...hourly.map(h => h.flights));

        const daily: { [key: string]: number } = {};
        flights.forEach(f => {
          if (f.parsed_data.DEP?.date) {
            daily[f.parsed_data.DEP.date] = (daily[f.parsed_data.DEP.date] || 0) + 1;
          }
        });
        state.timeSeries = Object.entries(daily).map(([date, count]) => ({ date, flights: count }));
        
        const dailyCounts = Object.values(daily);
        state.avgDailyFlights = dailyCounts.length > 0 ? Math.round(dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length) : 0;
        const sortedDailyCounts = [...dailyCounts].sort((a, b) => a - b);
        const mid = Math.floor(sortedDailyCounts.length / 2);
        state.medianDailyFlights = sortedDailyCounts.length % 2 === 0
          ? (sortedDailyCounts[mid - 1] + sortedDailyCounts[mid]) / 2
          : sortedDailyCounts[mid];

        const regionalData: { [key: string]: { flights: number; totalDuration: number } } = {};
        flights.forEach(f => {
          const regionName = standardizeRegionName(f["Центр ЕС ОрВД"]); // Используем обновленную функцию
          if (!regionalData[regionName]) {
            regionalData[regionName] = { flights: 0, totalDuration: 0 };
          }
          regionalData[regionName].flights++;
          regionalData[regionName].totalDuration += f.parsed_data.flight_duration_minutes || 0;
        });

        state.regions = Object.entries(regionalData).map(([name, data], index) => ({
          id: name,
          name,
          flights: data.flights,
          avgDuration: data.flights > 0 ? Math.round(data.totalDuration / data.flights) : 0,
          // Mock data for fields not available in flights data
          change: Math.round(Math.random() * 20 - 10),
          coords: { x: 100 + (index * 50) % 800, y: 100 + (index * 70) % 400 },
          area: 100000 + Math.random() * 500000,
          flightDensity: 0, // will be calculated next
          zeroFlightDays: 0, // needs more complex calculation
        }));
        state.regions.forEach(r => {
          r.flightDensity = (r.flights / r.area) * 1000;
        });
        console.log("Flight Data Standardized Regions:", state.regions.map(r => r.name));

        state.monthlyChange = 0; // Not enough data to calculate
        state.status = 'succeeded';
      })
      .addCase(fetchFlights.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default dataSlice.reducer;