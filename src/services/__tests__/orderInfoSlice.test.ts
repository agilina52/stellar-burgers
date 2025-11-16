/// <reference types="jest" />
jest.mock('@api', () => ({
  getOrderByNumberApi: jest.fn()
}));

import { configureStore } from '@reduxjs/toolkit';
import { orderInfoSlice, fetchOrderInfo } from '../orderInfoSlice';
import { getOrderByNumberApi } from '@api';
import { TOrder } from '@utils-types';
import type { AppDispatch } from '../store';

const orderInfoReducer = orderInfoSlice.reducer;

type OrderInfoState = {
  orderDetails: TOrder | null;
  isLoading: boolean;
};

type TestStore = {
  dispatch: AppDispatch;
  getState: () => { orderInfo: OrderInfoState };
};

const mockedGetOrderByNumberApi = getOrderByNumberApi as jest.MockedFunction<
  typeof getOrderByNumberApi
>;

const mockOrder: TOrder = {
  _id: 'order-1',
  status: 'done',
  name: 'Test Order',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  number: 777,
  ingredients: ['ing-1', 'bun-1']
};

const mockApiResponse = {
  orders: [mockOrder],
  success: true
};

describe('orderInfoSlice — reducer & thunk fetchOrderInfo', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('reducers', () => {
    it('редьюсер при undefined state и неизвестном action возвращает initial state', () => {
      const state = orderInfoReducer(undefined, {
        type: 'UNKNOWN_ACTION'
      });

      expect(state).toEqual({
        orderDetails: null,
        isLoading: false
      });
    });

    it('fetchStart устанавливает isLoading = true', () => {
      const next = orderInfoReducer(
        undefined,
        orderInfoSlice.actions.fetchStart()
      );
      expect(next.isLoading).toBe(true);
      expect(next.orderDetails).toBeNull();
    });

    it('fetchStop устанавливает isLoading = false', () => {
      const start: OrderInfoState = { orderDetails: null, isLoading: true };
      const next = orderInfoReducer(start, orderInfoSlice.actions.fetchStop());
      expect(next.isLoading).toBe(false);
      expect(next.orderDetails).toBeNull();
    });

    it('setOrder сохраняет детали заказа в state', () => {
      const next = orderInfoReducer(
        undefined,
        orderInfoSlice.actions.setOrder(mockOrder)
      );
      expect(next.orderDetails).toEqual(mockOrder);
      expect(next.isLoading).toBe(false);
    });

    it('clearOrderInfo сбрасывает orderDetails в null', () => {
      const start: OrderInfoState = {
        orderDetails: mockOrder,
        isLoading: false
      };
      const next = orderInfoReducer(
        start,
        orderInfoSlice.actions.clearOrderInfo()
      );
      expect(next.orderDetails).toBeNull();
      expect(next.isLoading).toBe(false);
    });

    it('setOrder с undefined оставляет orderDetails как undefined (поведение Redux Toolkit)', () => {
      const next = orderInfoReducer(
        undefined,
        orderInfoSlice.actions.setOrder(undefined as any)
      );
      expect(next.orderDetails).toBeUndefined();
    });
  });

  describe('thunk fetchOrderInfo (async flow)', () => {
    let store: TestStore;

    beforeEach(() => {
      const testStore = configureStore({
        reducer: { orderInfo: orderInfoReducer }
      }) as unknown as TestStore;

      store = testStore;
    });

    it('успешный запрос: записывает orderDetails и isLoading = false', async () => {
      mockedGetOrderByNumberApi.mockResolvedValue(mockApiResponse);

      await store.dispatch(fetchOrderInfo(101));

      const state = store.getState().orderInfo;
      expect(state.orderDetails).toEqual(mockOrder);
      expect(state.isLoading).toBe(false);
      expect(mockedGetOrderByNumberApi).toHaveBeenCalledWith(101);
      expect(mockedGetOrderByNumberApi).toHaveBeenCalledTimes(1);
    });

    it('ошибка в API: thunk завершается, isLoading=false и выводит ошибку в console', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockedGetOrderByNumberApi.mockRejectedValue(new Error('network fail'));

      await store.dispatch(fetchOrderInfo(999));

      const state = store.getState().orderInfo;
      expect(state.orderDetails).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(mockedGetOrderByNumberApi).toHaveBeenCalledWith(999);
      expect(mockedGetOrderByNumberApi).toHaveBeenCalledTimes(1);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Order error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('при успешном запросе извлекает первый заказ из массива orders', async () => {
      const multipleOrdersResponse = {
        orders: [mockOrder, { ...mockOrder, _id: 'order-2', number: 102 }],
        success: true
      };

      mockedGetOrderByNumberApi.mockResolvedValue(multipleOrdersResponse);

      await store.dispatch(fetchOrderInfo(101));

      const state = store.getState().orderInfo;
      expect(state.orderDetails).toEqual(mockOrder);
    });

    it('сохраняет предыдущие данные при ошибке запроса', async () => {
      const testStore = configureStore({
        reducer: { orderInfo: orderInfoReducer },
        preloadedState: {
          orderInfo: {
            orderDetails: mockOrder,
            isLoading: false
          }
        }
      }) as unknown as TestStore;

      store = testStore;

      mockedGetOrderByNumberApi.mockRejectedValue(new Error('network fail'));

      await store.dispatch(fetchOrderInfo(999));

      const state = store.getState().orderInfo;
      expect(state.orderDetails).toEqual(mockOrder);
      expect(state.isLoading).toBe(false);
    });

    it('при пустом массиве orders вызывает setOrder с undefined и оставляет orderDetails как undefined', async () => {
      const emptyOrdersResponse = {
        orders: [] as TOrder[],
        success: true
      };

      mockedGetOrderByNumberApi.mockResolvedValue(emptyOrdersResponse);

      await store.dispatch(fetchOrderInfo(101));

      const state = store.getState().orderInfo;
      expect(state.orderDetails).toBeUndefined();
      expect(state.isLoading).toBe(false);
    });

    it('при несуществующем заказе оставляет orderDetails как undefined', async () => {
      const orderNotFoundResponse = {
        orders: [] as TOrder[],
        success: true
      };

      mockedGetOrderByNumberApi.mockResolvedValue(orderNotFoundResponse);

      await store.dispatch(fetchOrderInfo(99999));

      const state = store.getState().orderInfo;
      expect(state.orderDetails).toBeUndefined();
      expect(state.isLoading).toBe(false);
    });

    it('при успешном запросе сбрасывает предыдущий заказ', async () => {
      const testStore = configureStore({
        reducer: { orderInfo: orderInfoReducer },
        preloadedState: {
          orderInfo: {
            orderDetails: mockOrder,
            isLoading: false
          }
        }
      }) as unknown as TestStore;

      store = testStore;

      const newOrder: TOrder = {
        ...mockOrder,
        _id: 'order-2',
        number: 888
      };

      const newApiResponse = {
        orders: [newOrder],
        success: true
      };

      mockedGetOrderByNumberApi.mockResolvedValue(newApiResponse);

      await store.dispatch(fetchOrderInfo(888));

      const state = store.getState().orderInfo;
      expect(state.orderDetails).toEqual(newOrder);
      expect(state.isLoading).toBe(false);
    });
  });
});
