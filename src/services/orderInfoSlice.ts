import { TOrder } from '@utils-types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getOrderByNumberApi } from '@api';

interface IOrderInfoState {
  orderDetails: TOrder | null;
  isLoading: boolean;
}

const initialState: IOrderInfoState = {
  orderDetails: null,
  isLoading: false
};

export const orderInfoSlice = createSlice({
  name: 'orderInfo',
  initialState,
  reducers: {
    setOrder: (state, action: PayloadAction<TOrder>) => {
      state.orderDetails = action.payload;
    },
    fetchStart: (state) => {
      state.isLoading = true;
    },
    fetchStop: (state) => {
      state.isLoading = false;
    },
    clearOrderInfo: (state) => {
      state.orderDetails = null;
    }
  }
});

export const openOrderInfo = (number: number) => async (dispatch: any) => {
  dispatch(orderInfoSlice.actions.fetchStart());
  try {
    const data = await getOrderByNumberApi(number);
    dispatch(orderInfoSlice.actions.setOrder(data.orders[0]));
  } catch (error) {
    console.error('Order error:', error);
  } finally {
    dispatch(orderInfoSlice.actions.fetchStop());
  }
};

export const { clearOrderInfo } = orderInfoSlice.actions;
