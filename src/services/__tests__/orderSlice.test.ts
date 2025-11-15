jest.mock('@api', () => ({
  orderBurgerApi: jest.fn()
}));

import { configureStore } from '@reduxjs/toolkit';
import { orderSlice, createOrder } from '../orderSlice';
import constructorReducer from '../constructorSlice';
import { orderBurgerApi } from '@api';

const orderReducer = orderSlice.reducer;
const mockedOrderBurgerApi = orderBurgerApi as jest.MockedFunction<
  typeof orderBurgerApi
>;

describe('orderSlice — reducer & thunk createOrder (без проверки авторизации)', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('reducer basic behavior', () => {
    it('редьюсер при undefined state и неизвестном action возвращает initial state', () => {
      const state = orderReducer(undefined, { type: 'UNKNOWN_ACTION' } as any);
      expect(state).toHaveProperty('order', null);
      expect(state).toHaveProperty('isLoading', false);
    });

    it('fetchStart устанавливает isLoading = true', () => {
      const next = orderReducer(undefined, { type: 'orderUser/fetchStart' });
      expect(next.isLoading).toBe(true);
    });

    it('fetchStop устанавливает isLoading = false', () => {
      const start = { order: null, isLoading: true } as any;
      const next = orderReducer(start, { type: 'orderUser/fetchStop' });
      expect(next.isLoading).toBe(false);
    });

    it('setOrder записывает order в state', () => {
      const sampleOrder = { number: 123, name: 'Test Order' } as any;
      const next = orderReducer(undefined, {
        type: 'orderUser/setOrder',
        payload: sampleOrder
      });
      expect(next.order).toEqual(sampleOrder);
    });

    it('clearOrder очищает order', () => {
      const start = { order: { number: 1 } as any, isLoading: false } as any;
      const next = orderReducer(start, { type: 'orderUser/clearOrder' });
      expect(next.order).toBeNull();
    });
  });

  describe('thunk createOrder (async flow) — без проверки авторизации', () => {
    it('успешный запрос: записывает order, очищает конструктор и isLoading=false (не проверяем авторизацию)', async () => {
      const apiResponse = {
        order: { number: 555, name: 'Burger' } as any,
        success: true
      };

      mockedOrderBurgerApi.mockResolvedValue(apiResponse as any);

      const sampleBun = { _id: 'bun-1', name: 'Bun' } as any;
      const sampleIngredient = {
        id: 'ing-1',
        originId: 'ing-1',
        uuid: 'u1'
      } as any;

      const store = configureStore({
        reducer: {
          orderUser: orderReducer as any,
          constructorBurger: constructorReducer as any
        },
        preloadedState: {
          constructorBurger: {
            bun: sampleBun,
            ingredients: [sampleIngredient]
          },
          orderUser: {
            order: null,
            isLoading: false
          }
        } as any
      } as any);

      await store.dispatch(createOrder(['ing-1', 'ing-2']) as any);

      const state = store.getState();
      expect(state.orderUser.order).toEqual(apiResponse.order);
      expect(state.orderUser.isLoading).toBe(false);

      expect(state.constructorBurger.bun).toBeNull();
      expect(state.constructorBurger.ingredients).toEqual([]);

      expect(mockedOrderBurgerApi).toHaveBeenCalled();
    });

    it('ошибка в API: thunk завершает работу и isLoading=false (console.error подавлён в тесте), без проверки авторизации', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockedOrderBurgerApi.mockRejectedValue(new Error('network fail'));

      const sampleBun = { _id: 'bun-1', name: 'Bun' } as any;
      const sampleIngredient = {
        id: 'ing-1',
        originId: 'ing-1',
        uuid: 'u1'
      } as any;

      const store = configureStore({
        reducer: {
          orderUser: orderReducer as any,
          constructorBurger: constructorReducer as any
        },
        preloadedState: {
          constructorBurger: {
            bun: sampleBun,
            ingredients: [sampleIngredient]
          },
          orderUser: {
            order: null,
            isLoading: false
          }
        } as any
      } as any);

      await store.dispatch(createOrder(['ing-1']) as any);

      const state = store.getState();
      expect(state.orderUser.order).toBeNull();
      expect(state.orderUser.isLoading).toBe(false);

      expect(state.constructorBurger.bun).toEqual(sampleBun);
      expect(state.constructorBurger.ingredients).toEqual([sampleIngredient]);

      expect(mockedOrderBurgerApi).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
