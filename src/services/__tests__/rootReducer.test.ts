import { combineSlices } from '@reduxjs/toolkit';
import { constructorSlice } from '../constructorSlice';
import { ingredientsSlice } from '../ingredientsSlice';
import { userProfileSlice } from '../userProfileSlice';
import { ingredientDetailsSlice } from '../ingredientDetailsSlice';
import { orderSlice } from '../orderSlice';
import { feedSlice } from '../feedSlice';
import { orderInfoSlice } from '../orderInfoSlice';

// Создаем rootReducer как в store.ts (но с другим именем чтобы избежать конфликта)
const testRootReducer = combineSlices(
  ingredientsSlice,
  userProfileSlice,
  constructorSlice,
  ingredientDetailsSlice,
  orderSlice,
  feedSlice,
  orderInfoSlice
);

// Тип для состояния
type TestRootState = ReturnType<typeof testRootReducer>;

describe('Корневой редьюсер (rootReducer)', () => {
  it('должен возвращать корректное начальное состояние при вызове с undefined состоянием и UNKNOWN_ACTION', () => {
    const state: TestRootState = testRootReducer(undefined, {
      type: 'UNKNOWN_ACTION'
    });

    expect(state).toEqual({
      ingredients: {
        items: [],
        isLoading: false
      },
      user: {
        isLoading: false,
        isAuthenticated: false,
        isRegistered: false,
        user: {
          name: '',
          email: ''
        },
        orders: []
      },
      constructorBurger: {
        bun: null,
        ingredients: []
      },
      ingredientDetails: {
        ingredient: null
      },
      orderUser: {
        order: null,
        isLoading: false
      },
      feed: {
        orders: [],
        total: 0,
        totalToday: 0,
        isLoading: false,
        success: false
      },
      orderInfo: {
        orderDetails: null,
        isLoading: false
      }
    });
  });

  it('должен корректно обрабатывать неизвестные экшены без изменения состояния', () => {
    const initialState = testRootReducer(undefined, { type: 'UNKNOWN_ACTION' });
    const newState = testRootReducer(initialState, {
      type: 'ANOTHER_UNKNOWN_ACTION'
    });

    expect(newState).toEqual(initialState);
  });

  it('должен содержать все необходимые слайсы в состоянии', () => {
    const state: TestRootState = testRootReducer(undefined, {
      type: 'UNKNOWN_ACTION'
    });

    expect(state).toHaveProperty('ingredients');
    expect(state).toHaveProperty('user');
    expect(state).toHaveProperty('constructorBurger');
    expect(state).toHaveProperty('ingredientDetails');
    expect(state).toHaveProperty('orderUser');
    expect(state).toHaveProperty('feed');
    expect(state).toHaveProperty('orderInfo');
  });

  // Добавляем тесты на структуру каждого слайса
  it('должен содержать корректную структуру для user слайса', () => {
    const state: TestRootState = testRootReducer(undefined, {
      type: 'UNKNOWN_ACTION'
    });

    expect(state.user).toEqual({
      isLoading: false,
      isAuthenticated: false,
      isRegistered: false,
      user: {
        name: '',
        email: ''
      },
      orders: []
    });
  });

  it('должен содержать корректную структуру для ingredients слайса', () => {
    const state: TestRootState = testRootReducer(undefined, {
      type: 'UNKNOWN_ACTION'
    });

    expect(state.ingredients).toEqual({
      items: [],
      isLoading: false
    });
  });
});
