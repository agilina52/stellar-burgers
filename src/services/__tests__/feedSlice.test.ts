jest.mock('@api', () => ({
  getFeedsApi: jest.fn()
}));

import { configureStore } from '@reduxjs/toolkit';
import feedReducer, { fetchFeed } from '../feedSlice';
import { getFeedsApi } from '@api';

const mockedGetFeedsApi = getFeedsApi as jest.MockedFunction<
  typeof getFeedsApi
>;

describe('feedSlice — reducer & thunk (default reducer export)', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('reducer basic behavior', () => {
    it('при undefined state и неизвестном action возвращает initial state', () => {
      const state = feedReducer(undefined, { type: 'UNKNOWN_ACTION' } as any);
      expect(state).toHaveProperty('orders');
      expect(Array.isArray(state.orders)).toBe(true);
      expect(state).toHaveProperty('total', 0);
      expect(state).toHaveProperty('totalToday', 0);
      expect(state).toHaveProperty('success', false);
      expect(state).toHaveProperty('isLoading', false);
    });

    it('fetchStart устанавливает isLoading = true', () => {
      const next = feedReducer(undefined, { type: 'feed/fetchStart' });
      expect(next.isLoading).toBe(true);
    });

    it('fetchStop устанавливает isLoading = false', () => {
      const start = {
        orders: [],
        total: 0,
        totalToday: 0,
        success: false,
        isLoading: true
      } as any;
      const next = feedReducer(start, { type: 'feed/fetchStop' });
      expect(next.isLoading).toBe(false);
    });

    it('setFeed обновляет orders, total, totalToday и success', () => {
      const payload = {
        orders: [
          { _id: 'o1', number: 1 } as any,
          { _id: 'o2', number: 2 } as any
        ],
        total: 10,
        totalToday: 2,
        success: true,
        isLoading: false
      };
      const next = feedReducer(undefined, { type: 'feed/setFeed', payload });
      expect(next.orders).toEqual(payload.orders);
      expect(next.total).toBe(10);
      expect(next.totalToday).toBe(2);
      expect(next.success).toBe(true);
    });
  });

  describe('thunk fetchFeed (async flow)', () => {
    it('успешный запрос: диспатчит setFeed и в finally диспатчит fetchStop (isLoading=false)', async () => {
      const apiResponse = {
        orders: [{ _id: 'o1', number: 1 } as any],
        total: 5,
        totalToday: 1,
        success: true,
        isLoading: false
      };

      mockedGetFeedsApi.mockResolvedValue(apiResponse);

      const store = configureStore({ reducer: { feed: feedReducer } });

      await store.dispatch(fetchFeed() as any);

      const state = store.getState().feed;
      expect(state.orders).toEqual(apiResponse.orders);
      expect(state.total).toBe(apiResponse.total);
      expect(state.totalToday).toBe(apiResponse.totalToday);
      expect(state.success).toBe(apiResponse.success);
      expect(state.isLoading).toBe(false);
      expect(mockedGetFeedsApi).toHaveBeenCalled();
    });

    it('ошибка в API: thunk завершает работу и fetchStop выставляет isLoading=false (и console.error подавлен в тесте)', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockedGetFeedsApi.mockRejectedValue(new Error('network fail'));

      const store = configureStore({ reducer: { feed: feedReducer } });

      await store.dispatch(fetchFeed() as any);

      const state = store.getState().feed;
      expect(state.orders).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(mockedGetFeedsApi).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
