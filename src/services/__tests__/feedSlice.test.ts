import { configureStore } from '@reduxjs/toolkit';
import feedReducer, { fetchFeed, feedSlice } from '../feedSlice';
import { getFeedsApi } from '@api';
import { TOrder, TOrdersData } from '@utils-types';
import type { AppDispatch, RootState } from '../store';

jest.mock('@api', () => ({
  getFeedsApi: jest.fn()
}));

const mockedGetFeedsApi = getFeedsApi as jest.MockedFunction<
  typeof getFeedsApi
>;

type FeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  success: boolean;
  isLoading: boolean;
};

type TestStore = {
  dispatch: AppDispatch;
  getState: () => { feed: FeedState };
};

const mockOrder: TOrder = {
  _id: 'o1',
  status: 'done',
  name: 'Test Order',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  number: 1,
  ingredients: ['ing1', 'ing2']
};

const mockApiResponse = {
  orders: [mockOrder],
  total: 5,
  totalToday: 1,
  success: true
};

describe('feedSlice — reducer & thunk (default reducer export)', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('reducer basic behavior', () => {
    it('при undefined state и неизвестном action возвращает initial state', () => {
      const state = feedReducer(undefined, { type: 'UNKNOWN_ACTION' });

      expect(state).toEqual({
        orders: [],
        total: 0,
        totalToday: 0,
        success: false,
        isLoading: false
      });
    });

    it('fetchStart устанавливает isLoading = true', () => {
      const next = feedReducer(undefined, feedSlice.actions.fetchStart());
      expect(next.isLoading).toBe(true);
      expect(next.orders).toEqual([]);
    });

    it('fetchStop устанавливает isLoading = false', () => {
      const start: FeedState = {
        orders: [],
        total: 0,
        totalToday: 0,
        success: false,
        isLoading: true
      };
      const next = feedReducer(start, feedSlice.actions.fetchStop());
      expect(next.isLoading).toBe(false);
      expect(next.orders).toEqual([]);
    });

    it('setFeed обновляет orders, total, totalToday и устанавливает success = true', () => {
      const payload: FeedState = {
        orders: [mockOrder],
        total: 10,
        totalToday: 2,
        success: true,
        isLoading: false
      };

      const next = feedReducer(undefined, feedSlice.actions.setFeed(payload));

      expect(next.orders).toEqual(payload.orders);
      expect(next.total).toBe(10);
      expect(next.totalToday).toBe(2);
      expect(next.success).toBe(true);
      expect(next.isLoading).toBe(false);
    });
  });

  describe('thunk fetchFeed (async flow)', () => {
    let store: TestStore;

    beforeEach(() => {
      const testStore = configureStore({
        reducer: { feed: feedReducer }
      }) as unknown as TestStore;

      store = testStore;
    });

    it('успешный запрос: диспатчит fetchStart, setFeed и fetchStop', async () => {
      mockedGetFeedsApi.mockResolvedValue(mockApiResponse);

      await store.dispatch(fetchFeed());

      const state = store.getState().feed;

      expect(state.orders).toEqual(mockApiResponse.orders);
      expect(state.total).toBe(mockApiResponse.total);
      expect(state.totalToday).toBe(mockApiResponse.totalToday);
      expect(state.success).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(mockedGetFeedsApi).toHaveBeenCalledTimes(1);
    });

    it('ошибка в API: thunk завершает работу с isLoading=false', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockedGetFeedsApi.mockRejectedValue(new Error('network fail'));

      await store.dispatch(fetchFeed());

      const state = store.getState().feed;

      expect(state.orders).toEqual([]);
      expect(state.total).toBe(0);
      expect(state.totalToday).toBe(0);
      expect(state.success).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(mockedGetFeedsApi).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Order error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
