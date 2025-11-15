/// <reference types="jest" />
jest.mock('@api', () => ({
  getOrderByNumberApi: jest.fn()
}));

import { configureStore } from '@reduxjs/toolkit';
import { orderInfoSlice, fetchOrderInfo } from '../orderInfoSlice';
import { getOrderByNumberApi } from '@api';

const orderInfoReducer = orderInfoSlice.reducer;
type OrderInfoState = ReturnType<typeof orderInfoReducer>;

const mockedGetOrderByNumberApi = getOrderByNumberApi as jest.MockedFunction<
  typeof getOrderByNumberApi
>;

describe('orderInfoSlice — reducer & thunk fetchOrderInfo', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('reducers', () => {
    it('редьюсер при undefined state и неизвестном action возвращает initial state', () => {
      const state = orderInfoReducer(undefined, {
        type: 'UNKNOWN_ACTION'
      } as any) as OrderInfoState;
      expect(state.orderDetails).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('fetchStart устанавливает isLoading = true', () => {
      const next = orderInfoReducer(
        undefined,
        orderInfoSlice.actions.fetchStart()
      ) as OrderInfoState;
      expect(next.isLoading).toBe(true);
    });

    it('fetchStop устанавливает isLoading = false', () => {
      const start = { orderDetails: null, isLoading: true } as any;
      const next = orderInfoReducer(
        start,
        orderInfoSlice.actions.fetchStop()
      ) as OrderInfoState;
      expect(next.isLoading).toBe(false);
    });

    it('setOrder сохраняет детали заказа в state', () => {
      const sampleOrder = { number: 777, name: 'Test Order' } as any;
      const next = orderInfoReducer(
        undefined,
        orderInfoSlice.actions.setOrder(sampleOrder)
      ) as OrderInfoState;
      expect(next.orderDetails as any).toEqual(sampleOrder as any);
    });

    it('clearOrderInfo сбрасывает orderDetails в null', () => {
      const start = {
        orderDetails: { number: 1 } as any,
        isLoading: false
      } as any;
      const next = orderInfoReducer(
        start,
        orderInfoSlice.actions.clearOrderInfo()
      ) as OrderInfoState;
      expect(next.orderDetails).toBeNull();
    });
  });

  describe('thunk fetchOrderInfo (async flow)', () => {
    it('успешный запрос: записывает orderDetails и isLoading = false', async () => {
      const sampleOrder = { number: 101, name: 'Order 101' } as any;
      const apiResponse = { orders: [sampleOrder] } as any;

      mockedGetOrderByNumberApi.mockResolvedValue(apiResponse);

      const store = configureStore({
        reducer: { orderInfo: orderInfoReducer as any }
      });

      await store.dispatch(fetchOrderInfo(101) as any);

      const state = (store.getState() as any).orderInfo as OrderInfoState;
      expect(state.orderDetails as any).toEqual(sampleOrder as any);
      expect(state.isLoading).toBe(false);
      expect(mockedGetOrderByNumberApi).toHaveBeenCalledWith(101);
    });

    it('ошибка в API: thunk завершается, isLoading=false и console.error подавлён в тесте', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockedGetOrderByNumberApi.mockRejectedValue(new Error('network fail'));

      const store = configureStore({
        reducer: { orderInfo: orderInfoReducer as any }
      });

      await store.dispatch(fetchOrderInfo(999) as any);

      const state = (store.getState() as any).orderInfo as OrderInfoState;
      expect(state.orderDetails).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(mockedGetOrderByNumberApi).toHaveBeenCalledWith(999);

      consoleSpy.mockRestore();
    });
  });
});
