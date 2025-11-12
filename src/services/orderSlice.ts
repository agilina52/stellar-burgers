import { TOrder } from '@utils-types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { orderBurgerApi } from '@api';
import { AppDispatch } from './store';
import { clearIngredient } from './constructorSlice';

interface IOrderState {
  order: TOrder | null;
  isLoading: boolean;
}

const initialState: IOrderState = {
  order: null,
  isLoading: false
};

export const orderSlice = createSlice({
  name: 'orderUser',
  initialState,
  reducers: {
    setOrder: (state, action: PayloadAction<TOrder>) => {
      state.order = action.payload;
    },
    fetchStart: (state) => {
      state.isLoading = true;
    },
    fetchStop: (state) => {
      state.isLoading = false;
    },
    clearOrder: (state) => {
      state.order = null;
    }
  }
});

export const createOrder =
  (ingredientIds: string[]) => async (dispatch: AppDispatch) => {
    dispatch(orderSlice.actions.fetchStart());
    try {
      const data = await orderBurgerApi(ingredientIds);
      dispatch(orderSlice.actions.setOrder(data.order));
      // Очищаем конструктор после успешного создания заказа
      dispatch(clearIngredient());
    } catch (error) {
      console.error('Order error:', error);
    } finally {
      dispatch(orderSlice.actions.fetchStop());
    }
  };

export const { clearOrder } = orderSlice.actions;
