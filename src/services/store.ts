import { constructorSlice } from './constructorSlice';
import { combineSlices, configureStore } from '@reduxjs/toolkit';
import ingredientsReducer, { ingredientsSlice } from './ingredientsSlice';
import { userProfileSlice } from './userProfileSlice';
import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook
} from 'react-redux';

const rootReducer = combineSlices(
  ingredientsSlice,
  userProfileSlice,
  constructorSlice
);
// const rootReducer = () => { ingredients:ingredientsReducer}; // Заменить на импорт настоящего редьюсера
const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const useDispatch: () => AppDispatch = () => dispatchHook();
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;
// selectors
export const getIngredients = (state: RootState) => state.ingredients.items;
export const getUserAuthenticatedState = (state: RootState) =>
  state.user.isAuthenticated;
export const getUserProfileState = (state: RootState) => state.user.user;
export const getBurgerConstructorState = (state: RootState) =>
  state.constructorBurger;
export default store;
