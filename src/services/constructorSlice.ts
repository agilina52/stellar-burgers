import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';
import { TIngredient, TConstructorIngredient } from '@utils-types';
interface IConstructorState {
  bun: TIngredient | null;
  ingredients: TConstructorIngredient[];
}

const initialState: IConstructorState = {
  bun: null,
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
      if (action.payload.type === 'bun') {
        state.bun = action.payload;
      } else {
        const localId = nanoid();
        const constructorItem: TConstructorIngredient = {
          ...action.payload,
          id: action.payload._id,
          originId: action.payload._id,
          uuid: localId
        } as TConstructorIngredient;

        state.ingredients.push(constructorItem);
      }
    },
    clearIngredient: (state) => {
      state.ingredients = [];
      state.bun = null;
    },
    deleteIngredient: (state, action: PayloadAction<number>) => {
      state.ingredients.splice(action.payload, 1);
    },
    moveIngredient: (
      state,
      action: PayloadAction<{ from: number; to: number }>
    ) => {
      const { from, to } = action.payload;
      if (
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= state.ingredients.length ||
        to > state.ingredients.length
      ) {
        return;
      }
      const [moved] = state.ingredients.splice(from, 1);
      state.ingredients.splice(to, 0, moved);
    }
  }
});

export const {
  setBun,
  addIngredient,
  clearIngredient,
  deleteIngredient,
  moveIngredient
} = constructorSlice.actions;

export default constructorSlice.reducer;
