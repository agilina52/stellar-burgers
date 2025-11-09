import { orderBurgerApi } from '@api';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TIngredient, TConstructorIngredient } from '@utils-types';

interface IConstructorState {
  bun: {
    price: number;
    name: string;
    image: string;
    _id: string;
  };
  ingredients: TConstructorIngredient[];
}

const initialState: IConstructorState = {
  bun: {
    price: 0,
    name: '',
    image: '',
    _id: ''
  },
  ingredients: []
};

export const constructorSlice = createSlice({
  name: 'constructorBurger',
  initialState,
  reducers: {
    setBun: (state, action: PayloadAction<TIngredient>) => {
      state.bun = action.payload;
    },
    addIngredient: (state, action: PayloadAction<TIngredient>) => {
      if (action.payload.type == 'bun') {
        state.bun.price = action.payload.price;
        state.bun.name = action.payload.name;
        state.bun.image = action.payload.image;
        state.bun._id = action.payload._id;
      } else {
        state.ingredients.push({ ...action.payload, id: action.payload._id });
      }
    },
    clearIngredient: (state) => {
      state.ingredients = [];
      state.bun = { price: 0, name: '', image: '', _id: '' };
    },
    deleteIngredient: (state, action: PayloadAction<number>) => {
      state.ingredients.splice(action.payload, 1);
    },
    moveIngredient: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedItem] = state.ingredients.splice(fromIndex, 1);
      state.ingredients.splice(toIndex, 0, movedItem);
    }
  }
});

export const { setBun, clearIngredient, deleteIngredient, moveIngredient } =
  constructorSlice.actions;
export default constructorSlice.reducer;
