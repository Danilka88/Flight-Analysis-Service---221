import { createSlice, PayloadAction, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { Flight, AltitudeLayerData } from '../types';
import localforage from 'localforage'; // Импортируем localforage
import { RootState } from './store';

type SortKey = 'date' | 'duration' | 'atc';
type SortDirection = 'asc' | 'desc';

interface FlightsState {
  allFlights: Flight[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  filters: {
    atcCenter: string;
    sid: string;
  };
  sorting: {
    key: SortKey;
    direction: SortDirection;
  };
  pagination: {
    currentPage: 1;
    itemsPerPage: 15;
  };
}

// Конфигурируем localforage
localforage.config({
    name: 'flight_analysis_db',
    storeName: 'flights_store'
});

/**
 * @function fetchFlights
 * @description Асинхронный thunk для получения списка всех полетов.
 * 
 * ### BACKEND INTEGRATION ###
 * Обращается к эндпоинту `GET /api/v1/flights`.
 * Бэкенд должен вернуть массив объектов `Flight[]`.
 * Подробности см. в файле `API_INTEGRATION.md`.
 */
export const fetchFlights = createAsyncThunk('flights/fetchFlights', async (_, { dispatch }) => {
  // Сначала пытаемся загрузить из IndexedDB
  const cachedFlights = await localforage.getItem<Flight[]>('allFlights');
  if (cachedFlights) {
    console.log("Loaded flights from IndexedDB");
    dispatch(setFlights(cachedFlights)); // Обновляем состояние Redux
    return cachedFlights; // Возвращаем кэшированные данные
  }

  // Если в IndexedDB нет, запрашиваем с сервера
  const response = await fetch('http://localhost:8000/api/flights');
  if (!response.ok) {
    throw new Error('Failed to fetch flights');
  }
  const data: Flight[] = await response.json();
  await localforage.setItem('allFlights', data); // Сохраняем в IndexedDB
  console.log("Fetched flights from API and saved to IndexedDB");
  return data;
});

const initialState: FlightsState = {
  allFlights: [], // Изначально пустой, будет заполнен через fetchFlights
  status: 'idle',
  filters: {
    atcCenter: '',
    sid: '',
  },
  sorting: {
    key: 'date',
    direction: 'desc',
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 15,
  },
};

const flightsSlice = createSlice({
  name: 'flights',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<{ filterName: keyof FlightsState['filters']; value: string }>) => {
      state.filters[action.payload.filterName] = action.payload.value;
      state.pagination.currentPage = 1; 
    },
    setSort: (state, action: PayloadAction<{ key: SortKey }>) => {
      if (state.sorting.key === action.payload.key) {
        state.sorting.direction = state.sorting.direction === 'asc' ? 'desc' : 'asc';
      } else {
        state.sorting.key = action.payload.key;
        state.sorting.direction = 'desc';
      }
      state.pagination.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setFlights: (state, action: PayloadAction<Flight[]>) => {
      state.allFlights = action.payload;
      state.status = 'succeeded';
      state.pagination.currentPage = 1;
      // LocalStorage больше не используется здесь напрямую
    },
    resetFlightsData: (state) => {
      state.allFlights = [];
      state.status = 'idle';
      state.filters = { atcCenter: '', sid: '' };
      state.sorting = { key: 'date', direction: 'desc' };
      state.pagination = { currentPage: 1, itemsPerPage: 15 };
      localforage.removeItem('allFlights'); // Удаляем данные из IndexedDB
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlights.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFlights.fulfilled, (state, action: PayloadAction<Flight[]>) => {
        state.status = 'succeeded';
        state.allFlights = action.payload; // Обновляем состояние, если данные пришли с сервера
      })
      .addCase(fetchFlights.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { setFilter, setSort, setCurrentPage, setFlights, resetFlightsData } = flightsSlice.actions;

// Memoized Selectors for performance
const selectAllFlights = (state: RootState) => state.flights.allFlights;
const selectFilters = (state: RootState) => state.flights.filters;
const selectSorting = (state: RootState) => state.flights.sorting;
const selectRegionName = (_state: RootState, regionName: string | null) => regionName;

export const selectFilteredFlights = createSelector(
  [selectAllFlights, selectFilters],
  (flights, filters) => {
    return flights.filter(flight => {
      const atcMatch = flight['Центр ЕС ОрВД'].toLowerCase().includes(filters.atcCenter.toLowerCase());
      const sidMatch = flight.parsed_data.SHR['Прочая информация'].SID.toLowerCase().includes(filters.sid.toLowerCase());
      return atcMatch && sidMatch;
    });
  }
);

export const selectFilteredAndSortedFlights = createSelector(
  [selectFilteredFlights, selectSorting],
  (filteredFlights, sorting) => {
    const sorted = [...filteredFlights]; // Create a mutable copy
    sorted.sort((a, b) => {
        const aVal = a.parsed_data.DEP?.date || '';
        const bVal = b.parsed_data.DEP?.date || '';

        const aDate = aVal.split('.').reverse().join('-');
        const bDate = bVal.split('.').reverse().join('-');

        switch (sorting.key) {
            case 'date':
                if (aDate < bDate) return -1;
                if (aDate > bDate) return 1;
                return 0;
            case 'duration':
                return (a.parsed_data.flight_duration_minutes || 0) - (b.parsed_data.flight_duration_minutes || 0);
            case 'atc':
                 return a['Центр ЕС ОрВД'].localeCompare(b['Центр ЕС ОрВД']);
            default:
                return 0;
        }
    });

    if (sorting.direction === 'desc') {
        sorted.reverse();
    }
    
    return sorted;
  }
);

export const selectFlightsForRegion = createSelector(
    [selectAllFlights, selectRegionName],
    (allFlights, regionName) => {
        if (!regionName) return [];
        return allFlights.filter(flight => flight['Центр ЕС ОрВД'] === regionName);
    }
);

export const selectAircraftTypesForRegion = createSelector(
    [selectFlightsForRegion],
    (regionalFlights) => {
        const typeCounts = regionalFlights.reduce((acc, flight) => {
            const type = flight.parsed_data.SHR['Прочая информация'].TYP.type || 'OTHER';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
    }
);

export const selectHourlyDistributionForRegion = createSelector(
    [selectFlightsForRegion],
    (regionalFlights) => {
        const hourly = Array.from({ length: 24 }, (_, i) => ({
            hour: i.toString().padStart(2, '0'),
            flights: 0,
        }));
        regionalFlights.forEach(flight => {
            const depTime = flight.parsed_data.DEP?.time;
            if (depTime && depTime.length >= 2) {
                const hourIndex = parseInt(depTime.substring(0, 2), 10);
                if (!isNaN(hourIndex) && hourIndex >= 0 && hourIndex < 24) {
                    hourly[hourIndex].flights++;
                }
            }
        });
        return hourly;
    }
);

// FIX: Added selector for altitude distribution for all flights. This was missing and causing import errors.
export const selectAltitudeDistribution = createSelector(
  [selectAllFlights],
  (flights): AltitudeLayerData[] => {
    const layers: { [key: string]: AltitudeLayerData } = {
        '0-50 м': { name: 'Сверхмалые (0-50 м)', BLA: 0, AER: 0, SHAR: 0, OTHER: 0 },
        '51-150 м': { name: 'Малые (51-150 м)', BLA: 0, AER: 0, SHAR: 0, OTHER: 0 },
        '151-500 м': { name: 'Средние (151-500 м)', BLA: 0, AER: 0, SHAR: 0, OTHER: 0 },
        '> 500 м': { name: 'Большие (> 500 м)', BLA: 0, AER: 0, SHAR: 0, OTHER: 0 },
        'Неизвестно': { name: 'Неизвестно', BLA: 0, AER: 0, SHAR: 0, OTHER: 0 },
    };

    flights.forEach(flight => {
        const altitude = flight.parsed_data.SHR.Маршрут.altitude?.max_m;
        const type = flight.parsed_data.SHR['Прочая информация'].TYP.type;
        
        let layerName: string;

        if (altitude === null || altitude === undefined) {
            layerName = 'Неизвестно';
        } else if (altitude <= 50) {
            layerName = '0-50 м';
        } else if (altitude <= 150) {
            layerName = '51-150 м';
        } else if (altitude <= 500) {
            layerName = '151-500 м';
        } else {
            layerName = '> 500 м';
        }
        
        const layer = layers[layerName];
        if (type === 'BLA' || type === 'AER' || type === 'SHAR') {
            layer[type]++;
        } else {
            layer.OTHER++;
        }
    });

    return Object.values(layers);
  }
);


export const selectAltitudeDistributionForRegion = createSelector(
  [selectFlightsForRegion],
  (flights): AltitudeLayerData[] => {
    const layers: { [key: string]: AltitudeLayerData } = {
        '0-50 м': { name: 'Сверхмалые (0-50 м)', BLA: 0, AER: 0, SHAR: 0, OTHER: 0 },
        '51-150 м': { name: 'Малые (51-150 м)', BLA: 0, AER: 0, SHAR: 0, OTHER: 0 },
        '151-500 м': { name: 'Средние (151-500 м)', BLA: 0, AER: 0, SHAR: 0, OTHER: 0 },
        '> 500 м': { name: 'Большие (> 500 м)', BLA: 0, AER: 0, SHAR: 0, OTHER: 0 },
        'Неизвестно': { name: 'Неизвестно', BLA: 0, AER: 0, SHAR: 0, OTHER: 0 },
    };

    flights.forEach(flight => {
        const altitude = flight.parsed_data.SHR.Маршрут.altitude?.max_m;
        const type = flight.parsed_data.SHR['Прочая информация'].TYP.type;
        
        let layerName: string;

        if (altitude === null || altitude === undefined) {
            layerName = 'Неизвестно';
        } else if (altitude <= 50) {
            layerName = '0-50 м';
        } else if (altitude <= 150) {
            layerName = '51-150 м';
        } else if (altitude <= 500) {
            layerName = '151-500 м';
        } else {
            layerName = '> 500 м';
        }
        
        const layer = layers[layerName];
        if (type === 'BLA' || type === 'AER' || type === 'SHAR') {
            layer[type]++;
        }
        else if (type) {
            layer.OTHER++;
        }
    });

    return Object.values(layers);
  }
);


export default flightsSlice.reducer;