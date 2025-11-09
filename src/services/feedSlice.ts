import { TOrder } from '@utils-types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getFeedsApi } from '@api';

interface IFeedState {
  orders: TOrder[];
  total: number;
  totalToday: number;
  success: boolean;
  isLoading: boolean;
}

const initialState: IFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  success: false,
  isLoading: false
};

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setFeed: (state, action: PayloadAction<IFeedState>) => {
      state.orders = action.payload.orders;
      state.total = action.payload.total;
      state.totalToday = action.payload.totalToday;
      state.success = action.payload.success;
    },
    fetchStart: (state) => {
      state.isLoading = true;
    },
    fetchStop: (state) => {
      state.isLoading = false;
    }
  }
});

export const fetchFeed = () => async (dispatch: any) => {
  dispatch(feedSlice.actions.fetchStart());
  try {
    const data = await getFeedsApi();
    dispatch(feedSlice.actions.setFeed(data as IFeedState));
  } catch (error) {
    console.error('Order error:', error);
  } finally {
    dispatch(feedSlice.actions.fetchStop());
  }
};

export const {} = feedSlice.actions;
