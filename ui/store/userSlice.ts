import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState, UserRole } from '../types';

// Функция для загрузки состояния пользователя из localStorage
const loadUserStateFromLocalStorage = (): UserState => {
  try {
    const serializedState = localStorage.getItem('userState');
    if (serializedState === null) {
      return {
        role: UserRole.OPERATOR,
        isAuthenticated: false,
        username: null,
      };
    }
    const storedState: UserState = JSON.parse(serializedState);
    // Проверяем, что роль корректна, если нет, устанавливаем OPERATOR
    if (!Object.values(UserRole).includes(storedState.role)) {
        storedState.role = UserRole.OPERATOR;
    }
    return storedState;
  } catch (error) {
    console.error("Error loading user state from localStorage:", error);
    return {
      role: UserRole.OPERATOR,
      isAuthenticated: false,
      username: null,
    };
  }
};

const initialState: UserState = loadUserStateFromLocalStorage(); // Инициализируем состояние из localStorage

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.username = action.payload;
      // Демонстрационная логика: если имя пользователя 'admin', назначаем роль администратора
      if (action.payload.toLowerCase() === 'admin') {
          state.role = UserRole.ADMIN;
      } else {
          state.role = UserRole.OPERATOR;
      }
      localStorage.setItem('userState', JSON.stringify(state)); // Сохраняем состояние в localStorage
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.username = null;
      state.role = UserRole.OPERATOR;
      localStorage.removeItem('userState'); // Удаляем состояние из localStorage
    },
    toggleRole: (state) => {
      // Эта логика позволяет администратору переключать свой вид для отладки
      if(state.username?.toLowerCase() === 'admin') {
        state.role = state.role === UserRole.ADMIN ? UserRole.OPERATOR : UserRole.ADMIN;
        localStorage.setItem('userState', JSON.stringify(state)); // Сохраняем обновленное состояние
      }
    },
  },
});

export const { loginSuccess, logout, toggleRole } = userSlice.actions;
export default userSlice.reducer;