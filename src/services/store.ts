import { constructorSlice } from './constructorSlice';
import { combineSlices, configureStore } from '@reduxjs/toolkit';
import ingredientsReducer, { ingredientsSlice } from './ingredientsSlice';
import { userProfileSlice } from './userProfileSlice';
import { ingredientDetailsSlice } from './ingredientDetailsSlice';

import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook
} from 'react-redux';
import { orderSlice } from './orderSlice';
import { feedSlice } from './feedSlice';
import { orderInfoSlice } from './orderInfoSlice';

const rootReducer = combineSlices(
  ingredientsSlice,
  userProfileSlice,
  constructorSlice,
  ingredientDetailsSlice,
  orderSlice,
  feedSlice,
  orderInfoSlice
);
const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export const useDispatch: () => AppDispatch = () => dispatchHook();
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;

export const getIngredients = (state: RootState) => state.ingredients.items;
export const getUserAuthenticatedState = (state: RootState) =>
  state.user.isAuthenticated;
export const getUserProfileState = (state: RootState) => state.user.user;
export const getBurgerConstructorState = (state: RootState) =>
  state.constructorBurger;
export const getUserOrders = (state: RootState) => state.user.orders;
export const getOrder = (state: RootState) => state.orderUser.order;
export const getOrderRequestState = (state: RootState) =>
  state.orderUser.isLoading;
export const getOrderInfoState = (state: RootState) => state;
export const getOrderDetails = (state: RootState) =>
  state.orderInfo.orderDetails;
export const getFeedOrdersState = (state: RootState) => state.feed.orders;
export const getFeedState = (state: RootState) => state;
export default store;
