/**
 * @file types.ts
 * @description Этот файл является ЕДИНЫМ ИСТОЧНИКОМ ИСТИНЫ для структур данных в приложении.
 * Бэкенд-разработчики должны гарантировать, что API-ответы строго соответствуют интерфейсам,
 * определенным в этом файле. Это обеспечивает типизацию и предотвращает ошибки
 * на стороне фронтенда.
 */

/**
 * @enum {string} UserRole
 * @description Определяет роли пользователей в системе.
 */
export enum UserRole {
  OPERATOR = 'operator',
  ADMIN = 'admin',
}

/**
 * @interface UserState
 * @description Структура состояния для текущего пользователя.
 */
export interface UserState {
  /**
   * @property {UserRole} role - Текущая роль пользователя.
   */
  role: UserRole;
  /**
   * @property {boolean} isAuthenticated - Флаг, указывающий, аутентифицирован ли пользователь.
   */
  isAuthenticated: boolean;
   /**
   * @property {string | null} username - Имя аутентифицированного пользователя.
   */
  username: string | null;
}

/**
 * @interface RegionData
 * @description Детальная аналитическая информация по одному региону.
 * Бэкенд должен агрегировать данные по каждому региону и возвращать массив этих объектов.
 */
export interface RegionData {
  /**
   * @property {string} id - Уникальный идентификатор региона (например, код ISO или ОКАТО).
   */
  id: string;
  /**
   * @property {string} name - Полное название региона.
   */
  name: string;
  /**
   * @property {number} flights - Общее количество полетов в этом регионе за отчетный период.
   */
  flights: number;
  /**
   * @property {number} avgDuration - Средняя продолжительность полета в минутах.
   * @description Рассчитывается как (сумма длительностей всех полетов) / (количество полетов).
   */
  avgDuration: number; // in minutes
  /**
   * @property {number} change - Процентное изменение количества полетов по сравнению с предыдущим периодом.
   */
  change: number; // percentage change
  /**
   * @property {{ x: number; y: number }} coords - Экранные координаты для визуализации на интерактивной карте.
   * @description Эти координаты используются для позиционирования "пузыря" региона на SVG-карте.
   * На бэкенде это могут быть реальные географические координаты (широта/долгота),
   * которые затем можно будет спроецировать. Для текущей реализации это условные координаты в viewBox 1000x600.
   */
  coords: { x: number; y: number };
   /**
   * @property {number} area - Площадь региона в квадратных километрах (км²).
   * @description Используется для расчета плотности полетов. Источник: Росстат или гео-данные.
   */
  area: number; // in km²
  /**
   * @property {number} flightDensity - Плотность полетов: количество полетов на 1000 км².
   * @description Рассчитывается на бэкенде по формуле: (flights / area) * 1000.
   */
  flightDensity: number;
  /**
   * @property {number} zeroFlightDays - Количество дней в отчетном периоде, когда в регионе не было ни одного полета.
   */
  zeroFlightDays: number;
}

/**
 * @interface TimeSeriesData
 * @description Структура данных для временного ряда (график динамики полетов).
 */
export interface TimeSeriesData {
  /**
   * @property {string} date - Дата в формате, понятном для отображения (например, 'DD.MM.YYYY').
   */
  date: string;
  /**
   * @property {number} flights - Общее количество полетов за эту дату.
   */
  flights: number;
}

/**
 * @interface HourlyData
 * @description Структура данных для графика распределения полетов по часам.
 */
export interface HourlyData {
    /**
     * @property {string} hour - Час суток (например, '00', '01', ..., '23').
     */
    hour: string;
    /**
     * @property {number} flights - Общее количество полетов в этот час за весь период.
     */
    flights: number;
}

/**
 * @interface DataState
 * @description Полная структура состояния аналитических данных.
 * ОСНОВНОЙ КОНТРАКТ ДЛЯ BACKEND. Главный API-эндпоинт (например, GET /api/v1/analytics/summary)
 * должен возвращать объект с полями, соответствующими этой структуре.
 */
export interface DataState {
  /**
   * @property {RegionData[]} regions - Массив с данными по всем регионам.
   */
  regions: RegionData[];
  /**
   * @property {TimeSeriesData[]} timeSeries - Данные для графика динамики полетов (например, за последние 30 дней).
   */
  timeSeries: TimeSeriesData[];
  /**
   * @property {HourlyData[]} hourlyDistribution - Данные для графика распределения по часам (24 точки).
   */
  hourlyDistribution: HourlyData[];
  /**
   * @property {number} totalFlights - Общее количество полетов по всем регионам. Рассчитывается на бэкенде.
   */
  totalFlights: number;
  /**
   * @property {number} avgFlightDuration - Средняя длительность полета по всем регионам. Рассчитывается на бэкенде.
   */
  avgFlightDuration: number;
  /**
   * @property {number} peakLoad - Максимальное количество полетов за один час за весь период. Рассчитывается на бэкенде.
   */
  peakLoad: number; // Now hourly peak
   /**
   * @property {number} avgDailyFlights - Среднее количество полетов в сутки. Рассчитывается на бэкенде.
   */
  avgDailyFlights: number;
  /**
   * @property {number} medianDailyFlights - Медианное количество полетов в сутки. Рассчитывается на бэкенде.
   */
  medianDailyFlights: number;
  /**
   * @property {number} monthlyChange - Процентное изменение общего числа полетов к прошлому месяцу. Рассчитывается на бэкенде.
   */
  monthlyChange: number;
  /**
   * @property {'idle' | 'loading' | 'succeeded' | 'failed'} status - Статус загрузки данных (управляется фронтендом).
   */
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

// --- ТИПЫ ДЛЯ ДАННЫХ О ПОЛЕТАХ ---

interface Coordinates {
    latitude: number;
    longitude: number;
}

interface ParsedPoint {
    raw: string;
    coordinates: Coordinates;
}

interface ParsedRoute {
    altitude: { min_m: number; max_m: number } | null;
    zona: { type: string; [key: string]: any } | null;
    waypoints: any[];
    raw: string;
}

interface ParsedOtherInfo {
    DEP: ParsedPoint;
    DEST?: ParsedPoint;
    DOF: string;
    OPR: string;
    REG?: string[];
    STS?: string;
    TYP: { count: number; type: string };
    RMK: { raw: string; [key: string]: any };
    SID: string;
    [key: string]: any;
}

interface ParsedSHR {
    "Тип сообщения": string;
    "Опознавательный индекс": string;
    "Аэродром вылета": string;
    "Время вылета": string;
    "Маршрут": ParsedRoute;
    "Аэродром назначения"?: string;
    "Время назначения"?: string;
    "Прочая информация": ParsedOtherInfo;
}

interface ParsedDEP {
    sid: string;
    date: string;
    time: string;
    coordinates: Coordinates;
    registration?: string[];
}

interface ParsedARR {
    sid: string;
    date: string;
    time: string;
    coordinates: Coordinates;
    registration?: string[];
}

interface ParsedData {
    SHR: ParsedSHR;
    DEP: ParsedDEP | null;
    ARR: ParsedARR | null;
    flight_duration_minutes: number | null;
}

export interface Flight {
    "Центр ЕС ОрВД": string;
    SHR_raw: string;
    DEP_raw: string | null;
    ARR_raw: string | null;
    parsed_data: ParsedData;
}

/**
 * @interface AltitudeLayerData
 * @description Структура данных для графика распределения полетов по высотным эшелонам.
 * Каждое свойство, кроме `name`, представляет тип ВС и содержит количество полетов.
 */
export interface AltitudeLayerData {
    name: string; // Название эшелона, например '0-50 м'
    BLA: number;
    AER: number;
    SHAR: number;
    OTHER: number;
}