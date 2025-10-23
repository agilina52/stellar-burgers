import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TIngredient, TConstructorIngredient } from '@utils-types';

interface IConstructorState {
  bun: {
    price: number;
    name: string;
    image: string;
  };
  ingredients: TConstructorIngredient[];
}

const initialState: IConstructorState = {
  bun: {
    price: 0,
    name: 'string',
    image: 'string'
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
      console.log(action);
      if (action.payload.type == 'bun') {
        state.bun.price = action.payload.price;
        state.bun.name = action.payload.name;
        state.bun.image = action.payload.image;
      } else {
        state.ingredients.push({ ...action.payload, id: action.payload._id });
      }
    }
  }
});

export const { setBun } = constructorSlice.actions;
export default constructorSlice.reducer;
