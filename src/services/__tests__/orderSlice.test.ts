jest.mock('@api', () => ({
  orderBurgerApi: jest.fn()
}));

import { configureStore } from '@reduxjs/toolkit';
import { orderSlice, createOrder } from '../orderSlice';
import constructorReducer from '../constructorSlice';
import { orderBurgerApi } from '@api';
import { TIngredient, TConstructorIngredient, TOrder } from '@utils-types';
import type { AppDispatch, RootState } from '../store';

const orderReducer = orderSlice.reducer;
const mockedOrderBurgerApi = orderBurgerApi as jest.MockedFunction<
  typeof orderBurgerApi
>;

type OrderState = {
  order: TOrder | null;
  isLoading: boolean;
};

type ConstructorState = {
  bun: TIngredient | null;
  ingredients: TConstructorIngredient[];
};

type TestState = {
  orderUser: OrderState;
  constructorBurger: ConstructorState;
};

type TestStore = {
  dispatch: AppDispatch;
  getState: () => TestState;
};

const mockBun: TIngredient = {
  _id: 'bun-1',
  name: 'Bun',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'bun-image-url',
  image_large: 'bun-image-large-url',
  image_mobile: 'bun-image-mobile-url'
};

const mockConstructorIngredient: TConstructorIngredient = {
  _id: 'ing-1',
  id: 'ing-1',
  name: 'Ingredient',
  type: 'main',
  proteins: 200,
  fat: 50,
  carbohydrates: 20,
  calories: 400,
  price: 200,
  image: 'ingredient-image-url',
  image_large: 'ingredient-image-large-url',
  image_mobile: 'ingredient-image-mobile-url'
};

const mockOrder: TOrder = {
  _id: 'order-1',
  status: 'done',
  name: 'Test Burger',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  number: 555,
  ingredients: ['ing-1', 'bun-1']
};

describe('orderSlice — reducer & thunk createOrder', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('reducer basic behavior', () => {
    it('редьюсер при undefined state и неизвестном action возвращает initial state', () => {
      const state = orderReducer(undefined, { type: 'UNKNOWN_ACTION' });

      expect(state).toEqual({
        order: null,
        isLoading: false
      });
    });

    it('fetchStart устанавливает isLoading = true', () => {
      const next = orderReducer(undefined, orderSlice.actions.fetchStart());
      expect(next.isLoading).toBe(true);
      expect(next.order).toBeNull();
    });

    it('fetchStop устанавливает isLoading = false', () => {
      const start: OrderState = { order: null, isLoading: true };
      const next = orderReducer(start, orderSlice.actions.fetchStop());
      expect(next.isLoading).toBe(false);
      expect(next.order).toBeNull();
    });

    it('setOrder записывает order в state', () => {
      const next = orderReducer(
        undefined,
        orderSlice.actions.setOrder(mockOrder)
      );
      expect(next.order).toEqual(mockOrder);
      expect(next.isLoading).toBe(false);
    });

    it('clearOrder очищает order', () => {
      const start: OrderState = { order: mockOrder, isLoading: false };
      const next = orderReducer(start, orderSlice.actions.clearOrder());
      expect(next.order).toBeNull();
      expect(next.isLoading).toBe(false);
    });
  });

  describe('thunk createOrder (async flow)', () => {
    let store: TestStore;

    beforeEach(() => {
      const testStore = configureStore({
        reducer: {
          orderUser: orderReducer,
          constructorBurger: constructorReducer
        },
        preloadedState: {
          constructorBurger: {
            bun: mockBun,
            ingredients: [mockConstructorIngredient]
          },
          orderUser: {
            order: null,
            isLoading: false
          }
        }
      }) as unknown as TestStore;

      store = testStore;
    });

    it('успешный запрос: записывает order, очищает конструктор и isLoading=false', async () => {
      const apiResponse = {
        order: mockOrder,
        name: 'Test Burger',
        success: true
      };

      mockedOrderBurgerApi.mockResolvedValue(apiResponse);

      await store.dispatch(createOrder(['ing-1', 'bun-1']));

      const state = store.getState();

      expect(state.orderUser.order).toEqual(mockOrder);
      expect(state.orderUser.isLoading).toBe(false);

      expect(state.constructorBurger.bun).toBeNull();
      expect(state.constructorBurger.ingredients).toEqual([]);

      expect(mockedOrderBurgerApi).toHaveBeenCalledWith(['ing-1', 'bun-1']);
      expect(mockedOrderBurgerApi).toHaveBeenCalledTimes(1);
    });

    it('ошибка в API: thunk завершает работу и isLoading=false', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockedOrderBurgerApi.mockRejectedValue(new Error('Ошибка при создании заказа'));

      await store.dispatch(createOrder(['ing-1']));

      const state = store.getState();

      expect(state.orderUser.order).toBeNull();
      expect(state.orderUser.isLoading).toBe(false);

      expect(state.constructorBurger.bun).toEqual(mockBun);
      expect(state.constructorBurger.ingredients).toEqual([
        mockConstructorIngredient
      ]);

      expect(mockedOrderBurgerApi).toHaveBeenCalledWith(['ing-1']);
      expect(mockedOrderBurgerApi).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Order error:',
        expect.objectContaining({
          message: 'Ошибка при создании заказа'
        })
      );

      consoleSpy.mockRestore();
    });

    it('при успешном заказе очищает конструктор даже если был предыдущий заказ', async () => {
      const testStore = configureStore({
        reducer: {
          orderUser: orderReducer,
          constructorBurger: constructorReducer
        },
        preloadedState: {
          constructorBurger: {
            bun: mockBun,
            ingredients: [mockConstructorIngredient]
          },
          orderUser: {
            order: mockOrder,
            isLoading: false
          }
        }
      }) as unknown as TestStore;

      store = testStore;

      const newOrder: TOrder = {
        ...mockOrder,
        _id: 'order-2',
        number: 556
      };

      const apiResponse = {
        order: newOrder,
        name: 'New Burger',
        success: true
      };

      mockedOrderBurgerApi.mockResolvedValue(apiResponse);

      await store.dispatch(createOrder(['ing-1', 'bun-1']));

      const state = store.getState();

      expect(state.orderUser.order).toEqual(newOrder);
      expect(state.constructorBurger.bun).toBeNull();
      expect(state.constructorBurger.ingredients).toEqual([]);
    });
  });
});
