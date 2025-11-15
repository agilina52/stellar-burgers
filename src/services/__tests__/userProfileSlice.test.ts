/**
 * @jest-environment jsdom
 */
/// <reference types="jest" />
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
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
  fetchLoginStart,
  fetchLoginError,
  login,
  register,
  getUser as fetchUser,
  updateProfile,
  fetchUserOrders,
  logout
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

type UserState = ReturnType<typeof userReducer>;

const originalLocalStorage = (global as any).localStorage as
  | Storage
  | undefined;

const mockLocalStorage = {
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getItem: jest.fn(),
  clear: jest.fn()
};

describe('userProfileSlice — редьюсер и thunks (без использования let)', () => {
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
      } as any) as UserState;
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isRegistered).toBe(false);
      expect(state.user).toEqual({ name: '', email: '' });
      expect(Array.isArray(state.orders)).toBe(true);
    });

    it('setAuthenticated: сохраняет user и выставляет isAuthenticated в true', () => {
      const payload = {
        user: { name: 'John', email: 'john@x.com' },
        accessToken: '',
        refreshToken: ''
      } as any;
      const next = userReducer(
        undefined,
        setAuthenticated(payload)
      ) as UserState;
      expect(next.user).toEqual(payload.user);
      expect(next.isAuthenticated).toBe(true);
      expect(next.isLoading).toBe(false);
    });

    it('fetchStart / fetchError / resetRegistration: корректно меняют флаги загрузки/регистрации', () => {
      const s1 = userReducer(undefined, fetchLoginStart()) as UserState;
      expect(s1.isLoading).toBe(true);
      expect(s1.isRegistered).toBe(false);

      const s2 = userReducer(s1, fetchLoginError()) as UserState;
      expect(s2.isLoading).toBe(false);
      expect(s2.isRegistered).toBe(false);

      const s3 = userReducer(s2, resetRegistration()) as UserState;
      expect(s3.isRegistered).toBe(false);
    });

    it('setUser: обновляет данные пользователя и isAuthenticated', () => {
      const action = {
        type: 'user/setUser',
        payload: { name: 'Alice', email: 'alice@x' }
      } as any;
      const next = userReducer(undefined, action) as UserState;
      expect(next.user).toEqual({ name: 'Alice', email: 'alice@x' });
      expect(next.isAuthenticated).toBe(true);
    });

    it('setOrders: сохраняет заказы пользователя', () => {
      const orders = [{ _id: 'o1' } as any];
      const action = { type: 'user/setOrders', payload: orders } as any;
      const next = userReducer(undefined, action) as UserState;
      expect(next.orders).toEqual(orders);
    });
  });

  describe('Thunks — асинхронные сценарии', () => {
    it('login (успех): сохраняет cookie, refreshToken и данные пользователя (isLoading остаётся true, т.к. fetchStop не вызывается)', async () => {
      const apiResp = {
        accessToken: 'Bearer token',
        refreshToken: 'r-token',
        user: { name: 'Bob', email: 'bob@example.com' }
      } as any;
      mockedLoginUserApi.mockResolvedValue(apiResp);

      const store = configureStore({ reducer: { user: userReducer as any } });

      await store.dispatch(login('bob@example.com', 'pwd') as any);

      const state = (store.getState() as any).user as UserState;
      expect(state.user).toEqual(apiResp.user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(true);

      expect(mockedLoginUserApi).toHaveBeenCalledWith({
        email: 'bob@example.com',
        password: 'pwd'
      });
      expect(mockedSetCookie).toHaveBeenCalledWith(
        'accessToken',
        apiResp.accessToken
      );
      expect((global as any).localStorage.setItem).toHaveBeenCalledWith(
        'refreshToken',
        apiResp.refreshToken
      );
    });

    it('login (ошибка): dispatch fetchError и не устанавливаются cookie/localStorage', async () => {
      mockedLoginUserApi.mockRejectedValue(new Error('auth fail'));

      const store = configureStore({ reducer: { user: userReducer as any } });

      await store.dispatch(login('a@b', 'bad') as any);

      const state = (store.getState() as any).user as UserState;
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual({ name: '', email: '' });

      expect(mockedSetCookie).not.toHaveBeenCalled();
      expect((global as any).localStorage.setItem).not.toHaveBeenCalled();
    });

    it('register (успех): регистрирует, сохраняет cookie и refreshToken (isLoading остаётся true)', async () => {
      const apiResp = {
        accessToken: 'Bearer token2',
        refreshToken: 'r2',
        user: { name: 'New', email: 'new@me' }
      } as any;
      mockedRegisterUserApi.mockResolvedValue(apiResp);

      const store = configureStore({ reducer: { user: userReducer as any } });

      await store.dispatch(register('new@me', 'pwd', 'New') as any);

      const state = (store.getState() as any).user as UserState;
      expect(state.user).toEqual(apiResp.user);
      expect(mockedSetCookie).toHaveBeenCalledWith(
        'accessToken',
        apiResp.accessToken
      );
      expect((global as any).localStorage.setItem).toHaveBeenCalledWith(
        'refreshToken',
        apiResp.refreshToken
      );
      expect(state.isLoading).toBe(true);
    });

    it('getUser (успех): получает и сохраняет user (isLoading остаётся true)', async () => {
      const apiResp = { user: { name: 'G', email: 'g@e' } } as any;
      mockedGetUserApi.mockResolvedValue(apiResp);

      const store = configureStore({ reducer: { user: userReducer as any } });

      await store.dispatch(fetchUser() as any);

      const state = (store.getState() as any).user as UserState;
      expect(state.user).toEqual(apiResp.user);
      expect(state.isAuthenticated).toBe(true);
      expect(mockedGetUserApi).toHaveBeenCalled();
      expect(state.isLoading).toBe(true);
    });

    it('updateProfile (успех): обновляет данные пользователя (isLoading остаётся true)', async () => {
      const apiResp = { user: { name: 'Upd', email: 'u@e' } } as any;
      mockedUpdateUserApi.mockResolvedValue(apiResp);

      const store = configureStore({ reducer: { user: userReducer as any } });

      await store.dispatch(updateProfile({ name: 'Upd' }) as any);

      const state = (store.getState() as any).user as UserState;
      expect(state.user).toEqual(apiResp.user);
      expect(mockedUpdateUserApi).toHaveBeenCalledWith({ name: 'Upd' });
      expect(state.isLoading).toBe(true);
    });

    it('updateProfile (ошибка): dispatch fetchError и thunk пробрасывает ошибку', async () => {
      mockedUpdateUserApi.mockRejectedValue(new Error('upd fail'));

      const store = configureStore({ reducer: { user: userReducer as any } });

      await expect(
        store.dispatch(updateProfile({ name: 'X' }) as any)
      ).rejects.toThrow('upd fail');

      const state = (store.getState() as any).user as UserState;
      expect(state.isLoading).toBe(false);
    });

    it('fetchUserOrders (успех): сохраняет заказы пользователя', async () => {
      const orders = [{ _id: 'ord1' } as any];
      mockedGetOrdersApi.mockResolvedValue(orders);

      const store = configureStore({ reducer: { user: userReducer as any } });

      await store.dispatch(fetchUserOrders() as any);

      const state = (store.getState() as any).user as UserState;
      expect(state.orders).toEqual(orders);
      expect(mockedGetOrdersApi).toHaveBeenCalled();
      expect(state.isLoading).toBe(true);
    });

    it('logout (успех): очищает user, cookie и localStorage', async () => {
      mockedLogoutApi.mockResolvedValue({ success: true } as any);

      const store = configureStore({
        reducer: { user: userReducer as any },
        preloadedState: {
          user: {
            isLoading: false,
            isAuthenticated: true,
            isRegistered: false,
            user: { name: 'A', email: 'a@a' },
            orders: []
          }
        } as any
      } as any);

      await store.dispatch(logout() as any);

      const state = (store.getState() as any).user as UserState;
      expect(state.user).toEqual({ name: '', email: '' });
      expect(mockedSetCookie).toHaveBeenCalledWith('accessToken', '', {
        expires: -1
      });
      expect((global as any).localStorage.removeItem).toHaveBeenCalledWith(
        'refreshToken'
      );
    });

    it('logout (ошибка): при ошибке API всё равно очищает user и storage (console.error подавлён)', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});

      mockedLogoutApi.mockRejectedValue(new Error('logout fail'));

      const store = configureStore({
        reducer: { user: userReducer as any },
        preloadedState: {
          user: {
            isLoading: false,
            isAuthenticated: true,
            isRegistered: false,
            user: { name: 'B', email: 'b@b' },
            orders: []
          }
        } as any
      } as any);

      await store.dispatch(logout() as any);

      const state = (store.getState() as any).user as UserState;
      expect(state.user).toEqual({ name: '', email: '' });
      expect(mockedSetCookie).toHaveBeenCalledWith('accessToken', '', {
        expires: -1
      });
      expect((global as any).localStorage.removeItem).toHaveBeenCalledWith(
        'refreshToken'
      );
    });
  });
});
