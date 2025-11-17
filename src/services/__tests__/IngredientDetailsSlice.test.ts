import { combineReducers } from '@reduxjs/toolkit';
import ingredientDetailsReducer, {
  setIngredientDetails,
  clearIngredientDetails
} from '../ingredientDetailsSlice';
import { TIngredient } from '@utils-types';

type IngredientDetailsState = {
  ingredient: TIngredient | null;
};

type TestRootState = {
  ingredientDetails: IngredientDetailsState;
  other: { ok: boolean };
};

describe('ingredientDetailsSlice — unit tests', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const sampleIngredient: TIngredient = {
    _id: 'ing-1',
    name: 'Tomato',
    type: 'main',
    proteins: 1,
    fat: 0,
    carbohydrates: 3,
    calories: 10,
    price: 5,
    image: 'img.png',
    image_large: 'img-large.png',
    image_mobile: 'img-mobile.png'
  };

  describe('initialization', () => {
    it('редьюсер при undefined state и неизвестном action возвращает начальное состояние', () => {
      const state = ingredientDetailsReducer(undefined, {
        type: 'UNKNOWN_ACTION'
      });

      expect(state).toEqual({
        ingredient: null
      });
    });
  });

  describe('reducers: setIngredientDetails / clearIngredientDetails', () => {
    it('setIngredientDetails: сохраняет переданный ingredient в state', () => {
      const next = ingredientDetailsReducer(
        undefined,
        setIngredientDetails(sampleIngredient)
      );
      expect(next.ingredient).toEqual(sampleIngredient);
    });

    it('clearIngredientDetails: сбрасывает ingredient в null', () => {
      const start: IngredientDetailsState = { ingredient: sampleIngredient };
      const next = ingredientDetailsReducer(start, clearIngredientDetails());
      expect(next.ingredient).toBeNull();
    });

    it('setIngredientDetails: заменяет существующий ingredient', () => {
      const firstIngredient: TIngredient = {
        ...sampleIngredient,
        _id: 'ing-1',
        name: 'First Ingredient'
      };

      const secondIngredient: TIngredient = {
        ...sampleIngredient,
        _id: 'ing-2',
        name: 'Second Ingredient'
      };

      const initialState: IngredientDetailsState = { 
        ingredient: firstIngredient 
      };
      const updatedState = ingredientDetailsReducer(
        initialState,
        setIngredientDetails(secondIngredient)
      );

      expect(updatedState.ingredient).toEqual(secondIngredient);
      expect(updatedState.ingredient?.name).toBe('Second Ingredient');
    });

    it('setIngredientDetails с null сбрасывает ingredient', () => {
      const initialState: IngredientDetailsState = { 
        ingredient: sampleIngredient 
      };
      const next = ingredientDetailsReducer(
        initialState, 
        setIngredientDetails(null as unknown as TIngredient)
      );
      expect(next.ingredient).toBeNull();
    });

    it('сохраняет состояние при неизвестных экшенах', () => {
      const initialState: IngredientDetailsState = { 
        ingredient: sampleIngredient 
      };
      const newState = ingredientDetailsReducer(initialState, { 
        type: 'UNKNOWN_ACTION' 
      });
      expect(newState).toEqual(initialState);
    });
  });

  describe('rootReducer integration (ingredientDetails присутствует в root)', () => {
    it('при combineReducers корректно возвращает начальную вложенную структуру', () => {
      const rootReducer = combineReducers({
        ingredientDetails: ingredientDetailsReducer,
        other: (state = { ok: true }) => state
      });

      const state = rootReducer(undefined, { type: 'UNKNOWN_ACTION' });

      expect(state).toHaveProperty('ingredientDetails');
      expect(state.ingredientDetails).toEqual({ ingredient: null });

      expect(state).toHaveProperty('other');
      expect(state.other).toEqual({ ok: true });
    });

    it('корневой редьюсер сохраняет структуру при неизвестных экшенах', () => {
      const rootReducer = combineReducers({
        ingredientDetails: ingredientDetailsReducer,
        other: (state = { ok: true }) => state
      });

      const initialState = rootReducer(undefined, { type: 'UNKNOWN_ACTION' });
      const newState = rootReducer(initialState, {
        type: 'ANOTHER_UNKNOWN_ACTION'
      });

      expect(newState).toEqual(initialState);
    });
  });
});
