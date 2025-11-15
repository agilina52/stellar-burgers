import { combineReducers } from '@reduxjs/toolkit';
import ingredientDetailsReducer, {
  setIngredientDetails,
  clearIngredientDetails
} from '../ingredientDetailsSlice';

describe('ingredientDetailsSlice — unit tests', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('initialization', () => {
    it('редьюсер при undefined state и неизвестном action возвращает начальное состояние', () => {
      const state = ingredientDetailsReducer(undefined, {
        type: 'UNKNOWN_ACTION'
      } as any);
      expect(state).toHaveProperty('ingredient', null);
    });
  });

  describe('reducers: setIngredientDetails / clearIngredientDetails', () => {
    const sampleIngredient = {
      _id: 'ing-1',
      name: 'Tomato',
      type: 'main',
      proteins: 1,
      fat: 0,
      carbohydrates: 3,
      calories: 10,
      price: 5,
      image: 'img.png'
    } as any;

    it('setIngredientDetails: сохраняет переданный ingredient в state', () => {
      const next = ingredientDetailsReducer(
        undefined,
        setIngredientDetails(sampleIngredient)
      );
      expect(next.ingredient).toEqual(sampleIngredient);
    });

    it('clearIngredientDetails: сбрасывает ingredient в null', () => {
      const start = { ingredient: sampleIngredient } as any;
      const next = ingredientDetailsReducer(start, clearIngredientDetails());
      expect(next.ingredient).toBeNull();
    });
  });

  describe('rootReducer integration (ingredientDetails присутствует в root)', () => {
    it('при combineReducers корректно возвращает начальную вложенную структуру', () => {
      const rootReducer = combineReducers({
        ingredientDetails: ingredientDetailsReducer,
        other: (state = { ok: true }, _action: any) => state
      });

      const state = rootReducer(undefined, { type: 'UNKNOWN_ACTION' } as any);

      expect(state).toHaveProperty('ingredientDetails');
      expect(state.ingredientDetails).toHaveProperty('ingredient', null);

      expect(state).toHaveProperty('other');
      expect(state.other).toEqual({ ok: true });
    });
  });
});
