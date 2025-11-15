// Мокаем модуль @api
jest.mock('@api', () => ({
  getIngredientsApi: jest.fn()
}));

import { configureStore } from '@reduxjs/toolkit';
import ingredientReducer, {
  ingredientsSlice,
  setIngredients,
  fetchIngredients
} from '../ingredientsSlice';

// Импорт мокнутой функции
import { getIngredientsApi } from '@api';

// Типизируем мок для удобства работы с mockResolvedValue / mockRejectedValue
const mockedGetIngredientsApi = getIngredientsApi as jest.MockedFunction<
  typeof getIngredientsApi
>;

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
    });

    it('setIngredients записывает items и сбрасывает isLoading', () => {
      const start = { items: [], isLoading: true } as any;
      const payload = [{ _id: 'i1', name: 'Ingredient 1' }] as any;
      const next = ingredientReducer(start, setIngredients(payload));
      expect(next.items).toEqual(payload);
      expect(next.isLoading).toBe(false);
    });

    it('fetchIngredientsError сбрасывает isLoading (ошибка в данном слайсе не сохраняется)', () => {
      const start = { items: [], isLoading: true } as any;
      const next = ingredientReducer(
        start,
        ingredientsSlice.actions.fetchIngredientsError()
      );
      expect(next.isLoading).toBe(false);
      expect(next.items).toEqual([]);
    });
  });

  describe('thunk fetchIngredients (async flow)', () => {
    it('успешный запрос: записывает данные и isLoading = false', async () => {
      const expected = [{ _id: 'i1', name: 'A' }] as any;
      mockedGetIngredientsApi.mockResolvedValue(expected);

      const store = configureStore({
        reducer: { ingredients: ingredientReducer }
      });

      await store.dispatch(fetchIngredients() as any);

      const state = store.getState().ingredients;
      expect(state.items).toEqual(expected);
      expect(state.isLoading).toBe(false);
      expect(mockedGetIngredientsApi).toHaveBeenCalled();
    });

    it('ошибка запроса: диспатчит fetchIngredientsError и isLoading = false', async () => {
      mockedGetIngredientsApi.mockRejectedValue(new Error('network fail'));

      const store = configureStore({
        reducer: { ingredients: ingredientReducer }
      });

      await store.dispatch(fetchIngredients() as any);

      const state = store.getState().ingredients;
      expect(state.items).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(mockedGetIngredientsApi).toHaveBeenCalled();
    });
  });
});
