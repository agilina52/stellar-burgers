import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TIngredient } from '@utils-types';

interface IIngredientDetailsState {
  ingredient: TIngredient | null;
}

const initialState: IIngredientDetailsState = {
  ingredient: null
};

export const ingredientDetailsSlice = createSlice({
  name: 'ingredientDetails',
  initialState,
  reducers: {
    setIngredientDetails: (state, action: PayloadAction<TIngredient>) => {
      state.ingredient = action.payload;
    },
    clearIngredientDetails: (state) => {
      state.ingredient = null;
    }
  }
});

export const { setIngredientDetails, clearIngredientDetails } =
  ingredientDetailsSlice.actions;
export default ingredientDetailsSlice.reducer;
