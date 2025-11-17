import constructorReducer, {
  setBun,
  addIngredient,
  clearIngredient,
  deleteIngredient,
  moveIngredient
} from '../constructorSlice';
import { TIngredient, TConstructorIngredient } from '@utils-types';

const createMockBun = (id: string, name: string): TIngredient => ({
  _id: id,
  name,
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'image-url',
  image_large: 'image-large-url',
  image_mobile: 'image-mobile-url'
});

const createMockIngredient = (
  id: string,
  name: string,
  type: 'main' | 'sauce' = 'main'
): TIngredient => ({
  _id: id,
  name,
  type,
  proteins: 200,
  fat: 50,
  carbohydrates: 20,
  calories: 400,
  price: 200,
  image: 'image-url',
  image_large: 'image-large-url',
  image_mobile: 'image-mobile-url'
});

const createMockConstructorIngredient = (
  id: string,
  uniqueId: string
): TConstructorIngredient => ({
  _id: id,
  name: `Test Ingredient ${id}`,
  type: 'main',
  proteins: 200,
  fat: 50,
  carbohydrates: 20,
  calories: 400,
  price: 200,
  image: 'image-url',
  image_large: 'image-large-url',
  image_mobile: 'image-mobile-url',
  id: uniqueId
});

type ConstructorState = {
  bun: TIngredient | null;
  ingredients: TConstructorIngredient[];
};

describe('constructorSlice — unit tests', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('initialization', () => {
    it('редьюсер при undefined state и неизвестном action возвращает начальное состояние', () => {
      const state = constructorReducer(undefined, {
        type: 'UNKNOWN_ACTION'
      });

      expect(state).toHaveProperty('bun', null);
      expect(state).toHaveProperty('ingredients');
      expect(Array.isArray(state.ingredients)).toBe(true);
      expect(state.ingredients.length).toBe(0);
    });
  });

  describe('добавление, удаление и перемещение ингредиентов', () => {
    const sampleBun = createMockBun('bun-1', 'Soft Bun');
    const ingA = createMockIngredient('ing-1', 'Patty A');
    const ingB = createMockIngredient('ing-2', 'Ketchup', 'sauce');

    it('addIngredient: если type === "bun" — устанавливает bun и не добавляет в ingredients', () => {
      const start: ConstructorState = { bun: null, ingredients: [] };
      const next = constructorReducer(start, addIngredient(sampleBun));
      expect(next.bun).toEqual(expect.objectContaining({ name: 'Soft Bun' }));
      expect(next.ingredients).toHaveLength(0);
    });

    it('addIngredient: добавляет не-булку с уникальным id', () => {
      const start: ConstructorState = { bun: null, ingredients: [] };
      const next = constructorReducer(start, addIngredient(ingA));

      expect(next.ingredients).toHaveLength(1);
      const item = next.ingredients[0];
      expect(item.id).toBeDefined();
      expect(typeof item.id).toBe('string');
      expect(item.name).toBe(ingA.name);
      expect(item._id).toBe(ingA._id); // оригинальный id сохраняется
    });

    it('addIngredient: заменяет существующую булку при добавлении новой', () => {
      const firstBun = createMockBun('bun-1', 'First Bun');
      const secondBun = createMockBun('bun-2', 'Second Bun');

      let state: ConstructorState = { bun: firstBun, ingredients: [] };
      state = constructorReducer(state, addIngredient(secondBun));

      expect(state.bun).toEqual(secondBun);
      expect(state.ingredients).toHaveLength(0);
    });

    it('deleteIngredient: удаляет ингредиент по индексу', () => {
      const start: ConstructorState = {
        bun: null,
        ingredients: [
          createMockConstructorIngredient('1', 'unique-id-1'),
          createMockConstructorIngredient('2', 'unique-id-2')
        ]
      };

      const next = constructorReducer(start, deleteIngredient(0));
      expect(next.ingredients).toHaveLength(1);
      expect(next.ingredients[0].id).toBe('unique-id-2');
    });

    it('moveIngredient: корректно перемещает элемент при валидных индексах', () => {
      const start: ConstructorState = {
        bun: null,
        ingredients: [
          createMockConstructorIngredient('1', 'unique-id-1'),
          createMockConstructorIngredient('2', 'unique-id-2'),
          createMockConstructorIngredient('3', 'unique-id-3')
        ]
      };

      const next = constructorReducer(
        start,
        moveIngredient({ from: 0, to: 2 })
      );
      expect(next.ingredients.map((i) => i.id)).toEqual([
        'unique-id-2',
        'unique-id-3',
        'unique-id-1'
      ]);
    });

    it('moveIngredient: игнорирует некорректные операции (same/negative/out-of-range)', () => {
      const start: ConstructorState = {
        bun: null,
        ingredients: [
          createMockConstructorIngredient('1', 'unique-id-1'),
          createMockConstructorIngredient('2', 'unique-id-2')
        ]
      };

      const same = constructorReducer(
        start,
        moveIngredient({ from: 0, to: 0 })
      );
      expect(same.ingredients.map((i) => i.id)).toEqual([
        'unique-id-1',
        'unique-id-2'
      ]);

      const negative = constructorReducer(
        start,
        moveIngredient({ from: -1, to: 1 })
      );
      expect(negative.ingredients.map((i) => i.id)).toEqual([
        'unique-id-1',
        'unique-id-2'
      ]);

      const outOfRange = constructorReducer(
        start,
        moveIngredient({ from: 0, to: 10 })
      );
      expect(outOfRange.ingredients.map((i) => i.id)).toEqual([
        'unique-id-1',
        'unique-id-2'
      ]);
    });

    it('clearIngredient: очищает bun и ingredients', () => {
      const start: ConstructorState = {
        bun: sampleBun,
        ingredients: [createMockConstructorIngredient('x', 'unique-id-x')]
      };

      const next = constructorReducer(start, clearIngredient());
      expect(next.bun).toBeNull();
      expect(next.ingredients).toEqual([]);
    });

    it('setBun: устанавливает булку', () => {
      const start: ConstructorState = { bun: null, ingredients: [] };
      const next = constructorReducer(start, setBun(sampleBun));

      expect(next.bun).toEqual(sampleBun);
      expect(next.ingredients).toHaveLength(0);
    });

    it('добавляет несколько ингредиентов в конструктор', () => {
      let state: ConstructorState = { bun: sampleBun, ingredients: [] };

      state = constructorReducer(state, addIngredient(ingA));
      expect(state.ingredients).toHaveLength(1);

      state = constructorReducer(state, addIngredient(ingB));
      expect(state.ingredients).toHaveLength(2);

      expect(state.ingredients[0].name).toBe('Patty A');
      expect(state.ingredients[1].name).toBe('Ketchup');
    });

    it('сохраняет все свойства ингредиента при добавлении в конструктор', () => {
      const start: ConstructorState = { bun: null, ingredients: [] };
      const complexIngredient: TIngredient = {
        _id: 'complex-1',
        name: 'Complex Ingredient',
        type: 'main',
        proteins: 300,
        fat: 100,
        carbohydrates: 50,
        calories: 600,
        price: 500,
        image: 'complex-image-url',
        image_large: 'complex-image-large-url',
        image_mobile: 'complex-image-mobile-url'
      };

      const next = constructorReducer(start, addIngredient(complexIngredient));

      const addedIngredient = next.ingredients[0];
      expect(addedIngredient.name).toBe('Complex Ingredient');
      expect(addedIngredient.proteins).toBe(300);
      expect(addedIngredient.price).toBe(500);
      expect(addedIngredient.id).toBeDefined();
    });
  });
});
