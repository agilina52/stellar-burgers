/**
 * @jest-environment jsdom
 */
/// <reference types="jest" />
jest.mock('@api', () => ({
  loginUserApi: jest.fn(),
  registerUserApi: jest.fn(),
  getUserApi: jest.fn(),
  updateUserApi: jest.fn(),
  getOrdersApi: jest.fn(),
  logoutApi: jest.fn()
}));

jest.mock('../../utils/cookie', () => ({
  setCookie: jest.fn()
}));

import { configureStore } from '@reduxjs/toolkit';
import userReducer, {
  setAuthenticated,
  resetRegistration,
  login,
  register,
  getUser as fetchUser,
  updateProfile,
  fetchUserOrders,
  logout,
  userProfileSlice
} from '../userProfileSlice';
import {
  loginUserApi,
  registerUserApi,
  getUserApi,
  updateUserApi,
  getOrdersApi,
  logoutApi
} from '@api';
import { setCookie } from '../../utils/cookie';
import { TUser, TOrder } from '@utils-types';
import type { AppDispatch } from '../store';

const mockedLoginUserApi = loginUserApi as jest.MockedFunction<
  typeof loginUserApi
>;
const mockedRegisterUserApi = registerUserApi as jest.MockedFunction<
  typeof registerUserApi
>;
const mockedGetUserApi = getUserApi as jest.MockedFunction<typeof getUserApi>;
const mockedUpdateUserApi = updateUserApi as jest.MockedFunction<
  typeof updateUserApi
>;
const mockedGetOrdersApi = getOrdersApi as jest.MockedFunction<
  typeof getOrdersApi
>;
const mockedLogoutApi = logoutApi as jest.MockedFunction<typeof logoutApi>;
const mockedSetCookie = setCookie as jest.MockedFunction<typeof setCookie>;

type UserState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  isRegistered: boolean;
  user: TUser;
  orders: TOrder[];
};

type TestStore = {
  dispatch: AppDispatch;
  getState: () => { user: UserState };
};

const mockUser: TUser = {
  name: 'John',
  email: 'john@example.com'
};

const mockOrder: TOrder = {
  _id: 'order-1',
  status: 'done',
  name: 'Test Order',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  number: 123,
  ingredients: ['ing-1', 'bun-1']
};

type AuthResponse = {
  success: boolean;
  user: TUser;
  accessToken: string;
  refreshToken: string;
};

const originalLocalStorage = (global as any).localStorage as
  | Storage
  | undefined;

const mockLocalStorage = {
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getItem: jest.fn(),
  clear: jest.fn()
};

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('userProfileSlice — редьюсер и thunks', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      configurable: true,
      writable: true
    });

    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.clear.mockClear();

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (originalLocalStorage !== undefined) {
      Object.defineProperty(global, 'localStorage', {
        value: originalLocalStorage,
        configurable: true,
        writable: true
      });
    } else {
      delete (global as any).localStorage;
    }

    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('Редьюсер — базовое поведение', () => {
    it('Initial state: возвращает корректное начальное состояние', () => {
      const state = userReducer(undefined, {
        type: 'UNKNOWN_ACTION'
      });

      expect(state).toEqual({
        isLoading: false,
        isAuthenticated: false,
        isRegistered: false,
        user: { name: '', email: '' },
        orders: []
      });
    });

    it('setAuthenticated: сохраняет user и выставляет isAuthenticated в true', () => {
      const payload: AuthResponse = {
        success: true,
        user: mockUser,
        accessToken: 'token',
        refreshToken: 'refresh-token'
      };

      const next = userReducer(undefined, setAuthenticated(payload));
      expect(next.user).toEqual(payload.user);
      expect(next.isAuthenticated).toBe(true);
      expect(next.isLoading).toBe(false);
    });

    it('fetchStart / fetchError / resetRegistration: корректно меняют флаги загрузки/регистрации', () => {
      const s1 = userReducer(undefined, userProfileSlice.actions.fetchStart());
      expect(s1.isLoading).toBe(true);
      expect(s1.isRegistered).toBe(false);

      const s2 = userReducer(s1, userProfileSlice.actions.fetchError());
      expect(s2.isLoading).toBe(false);
      expect(s2.isRegistered).toBe(false);

      const s3 = userReducer(s2, resetRegistration());
      expect(s3.isRegistered).toBe(false);
    });

    it('setUser: обновляет данные пользователя и isAuthenticated', () => {
      const next = userReducer(
        undefined,
        userProfileSlice.actions.setUser(mockUser)
      );
      expect(next.user).toEqual(mockUser);
      expect(next.isAuthenticated).toBe(true);
    });

    it('setOrders: сохраняет заказы пользователя', () => {
      const orders = [mockOrder];
      const next = userReducer(
        undefined,
        userProfileSlice.actions.setOrders(orders)
      );
      expect(next.orders).toEqual(orders);
    });

    it('setUser с пустым пользователем: устанавливает isAuthenticated в false', () => {
      const emptyUser: TUser = { name: '', email: '' };
      const next = userReducer(
        undefined,
        userProfileSlice.actions.setUser(emptyUser)
      );
      expect(next.user).toEqual(emptyUser);
      expect(next.isAuthenticated).toBe(false);
    });
  });

  describe('Thunks — асинхронные сценарии', () => {
    let store: TestStore;

    beforeEach(() => {
      const testStore = configureStore({
        reducer: { user: userReducer }
      });

      store = testStore as TestStore;
    });

    it('logout (успех): очищает user, cookie и localStorage', async () => {
      mockedLogoutApi.mockResolvedValue({ success: true });

      const testStoreWithAuth = configureStore({
        reducer: { user: userReducer },
        preloadedState: {
          user: {
            isLoading: false,
            isAuthenticated: true,
            isRegistered: false,
            user: mockUser,
            orders: [mockOrder]
          }
        }
      });

      store = testStoreWithAuth as TestStore;

      await store.dispatch(logout());
      await flushPromises();

      const state = store.getState().user;
      expect(state.user).toEqual({ name: '', email: '' });
      expect(state.isAuthenticated).toBe(false);
      expect(state.orders).toEqual([mockOrder]);
      expect(mockedSetCookie).toHaveBeenCalledWith('accessToken', '', {
        expires: -1
      });
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });

    it('logout (ошибка): при ошибке API всё равно очищает user и storage', async () => {
      mockedLogoutApi.mockRejectedValue(new Error('logout fail'));

      const testStoreWithAuth = configureStore({
        reducer: { user: userReducer },
        preloadedState: {
          user: {
            isLoading: false,
            isAuthenticated: true,
            isRegistered: false,
            user: mockUser,
            orders: [mockOrder]
          }
        }
      });

      store = testStoreWithAuth as TestStore;

      await store.dispatch(logout());
      await flushPromises();

      const state = store.getState().user;
      expect(state.user).toEqual({ name: '', email: '' });
      expect(state.isAuthenticated).toBe(false);
      expect(state.orders).toEqual([mockOrder]);
      expect(mockedSetCookie).toHaveBeenCalledWith('accessToken', '', {
        expires: -1
      });
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('Edge cases', () => {
    let store: TestStore;

    beforeEach(() => {
      const testStore = configureStore({
        reducer: { user: userReducer }
      });

      store = testStore as TestStore;
    });

    it('должен корректно обрабатывать последовательные вызовы thunks', async () => {
      const apiResp = {
        success: true,
        user: mockUser
      };

      mockedGetUserApi.mockResolvedValue(apiResp);

      await store.dispatch(fetchUser());
      await flushPromises();

      await store.dispatch(fetchUser());
      await flushPromises();

      const state = store.getState().user;
      expect(state.user).toEqual(mockUser);
      expect(state.isLoading).toBe(true);
      expect(mockedGetUserApi).toHaveBeenCalledTimes(2);
    });

    it('должен корректно обрабатывать частичное обновление профиля', async () => {
      const updatedUser: TUser = { name: 'Updated', email: 'john@example.com' };
      const apiResp = {
        success: true,
        user: updatedUser
      };

      mockedUpdateUserApi.mockResolvedValue(apiResp);

      await store.dispatch(updateProfile({ name: 'Updated' }));
      await flushPromises();

      const state = store.getState().user;
      expect(state.user).toEqual(updatedUser);
      expect(state.isLoading).toBe(true);
    });

    it('должен сохранять состояние при неизвестных экшенах', () => {
      const initialState = store.getState().user;
      const newState = userReducer(initialState, { type: 'UNKNOWN_ACTION' });

      expect(newState).toEqual(initialState);
    });
  });
});
