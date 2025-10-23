import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getIngredientsApi } from '@api';
import { TIngredient } from '@utils-types';

interface IIngredientsState {
  items: TIngredient[];
  isLoading: boolean;
}

const initialState: IIngredientsState = {
  items: [],
  isLoading: false
};

export const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    setIngredients: (state, action: PayloadAction<TIngredient[]>) => {
      state.items = action.payload;
      state.isLoading = false;
    },
    fetchIngredientsStart: (state) => {
      state.isLoading = true;
    },
    fetchIngredientsError: (state) => {
      state.isLoading = false;
    }
  }
});

export const fetchIngredients = () => async (dispatch: any) => {
  dispatch(ingredientsSlice.actions.fetchIngredientsStart());
  try {
    const ingredients = await getIngredientsApi();
    dispatch(ingredientsSlice.actions.setIngredients(ingredients));
  } catch (error) {
    dispatch(ingredientsSlice.actions.fetchIngredientsError());
  }
};

export const { setIngredients } = ingredientsSlice.actions;
export default ingredientsSlice.reducer;
