jest.mock('@api', () => ({
  getIngredientsApi: jest.fn()
}));

import { configureStore } from '@reduxjs/toolkit';
import ingredientReducer, {
  ingredientsSlice,
  setIngredients,
  fetchIngredients
} from '../ingredientsSlice';
import { TIngredient } from '@utils-types';
import type { AppDispatch } from '../store';

import { getIngredientsApi } from '@api';

const mockedGetIngredientsApi = getIngredientsApi as jest.MockedFunction<
  typeof getIngredientsApi
>;

type IngredientsState = {
  items: TIngredient[];
  isLoading: boolean;
};

type TestStore = {
  dispatch: AppDispatch;
  getState: () => { ingredients: IngredientsState };
};

const mockIngredient: TIngredient = {
  _id: 'i1',
  name: 'Ingredient 1',
  type: 'main',
  proteins: 10,
  fat: 5,
  carbohydrates: 15,
  calories: 100,
  price: 50,
  image: 'image-url',
  image_large: 'image-large-url',
  image_mobile: 'image-mobile-url'
};

const mockIngredients: TIngredient[] = [mockIngredient];

describe('ingredientsSlice — reducer & thunk', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('reducer (fetchIngredientsStart / setIngredients / fetchIngredientsError)', () => {
    it('fetchIngredientsStart устанавливает isLoading = true', () => {
      const next = ingredientReducer(
        undefined,
        ingredientsSlice.actions.fetchIngredientsStart()
      );
      expect(next.isLoading).toBe(true);
      expect(next.items).toEqual([]);
    });

    it('setIngredients записывает items и сбрасывает isLoading', () => {
      const start: IngredientsState = { items: [], isLoading: true };
      const next = ingredientReducer(start, setIngredients(mockIngredients));
      expect(next.items).toEqual(mockIngredients);
      expect(next.isLoading).toBe(false);
    });

    it('fetchIngredientsError сбрасывает isLoading', () => {
      const start: IngredientsState = { items: [], isLoading: true };
      const next = ingredientReducer(
        start,
        ingredientsSlice.actions.fetchIngredientsError()
      );
      expect(next.isLoading).toBe(false);
      expect(next.items).toEqual([]);
    });

    it('сохраняет существующие items при fetchIngredientsError', () => {
      const start: IngredientsState = {
        items: mockIngredients,
        isLoading: true
      };
      const next = ingredientReducer(
        start,
        ingredientsSlice.actions.fetchIngredientsError()
      );
      expect(next.isLoading).toBe(false);
      expect(next.items).toEqual(mockIngredients);
    });
  });

  describe('thunk fetchIngredients (async flow)', () => {
    let store: TestStore;

    beforeEach(() => {
      const testStore = configureStore({
        reducer: { ingredients: ingredientReducer }
      }) as unknown as TestStore;

      store = testStore;
    });

    it('успешный запрос: записывает данные и isLoading = false', async () => {
      mockedGetIngredientsApi.mockResolvedValue(mockIngredients);

      await store.dispatch(fetchIngredients());

      const state = store.getState().ingredients;
      expect(state.items).toEqual(mockIngredients);
      expect(state.isLoading).toBe(false);
      expect(mockedGetIngredientsApi).toHaveBeenCalledTimes(1);
    });

    it('ошибка запроса: диспатчит fetchIngredientsError и isLoading = false', async () => {
      mockedGetIngredientsApi.mockRejectedValue(new Error('network fail'));

      await store.dispatch(fetchIngredients());

      const state = store.getState().ingredients;
      expect(state.items).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(mockedGetIngredientsApi).toHaveBeenCalledTimes(1);
    });

    it('сохраняет предыдущие данные при ошибке запроса', async () => {
      const existingIngredients: IngredientsState = {
        items: mockIngredients,
        isLoading: false
      };

      const testStore = configureStore({
        reducer: { ingredients: ingredientReducer },
        preloadedState: {
          ingredients: existingIngredients
        }
      }) as unknown as TestStore;

      store = testStore;

      mockedGetIngredientsApi.mockRejectedValue(new Error('network fail'));

      await store.dispatch(fetchIngredients());

      const state = store.getState().ingredients;
      expect(state.items).toEqual(mockIngredients);
      expect(state.isLoading).toBe(false);
    });
  });
});
