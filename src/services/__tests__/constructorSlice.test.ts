import constructorReducer, {
  setBun,
  addIngredient,
  clearIngredient,
  deleteIngredient,
  moveIngredient
} from '../constructorSlice';

describe('constructorSlice — unit tests', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('initialization', () => {
    it('редьюсер при undefined state и неизвестном action возвращает начальное состояние', () => {
      const state = constructorReducer(undefined, {
        type: 'UNKNOWN_ACTION'
      } as any);

      expect(state).toHaveProperty('bun', null);
      expect(state).toHaveProperty('ingredients');
      expect(Array.isArray(state.ingredients)).toBe(true);
      expect(state.ingredients.length).toBe(0);
    });
  });

  describe('добавление, удаление и перемещение ингредиентов', () => {
    const sampleBun = { _id: 'bun-1', type: 'bun', name: 'Soft Bun' } as any;
    const ingA = { _id: 'ing-1', type: 'main', name: 'Patty A' } as any;
    const ingB = { _id: 'ing-2', type: 'sauce', name: 'Ketchup' } as any;

    it('addIngredient: если type === "bun" — устанавливает bun и не добавляет в ingredients', () => {
      const start = { bun: null, ingredients: [] } as any;
      const next = constructorReducer(
        start,
        addIngredient({ ...sampleBun, type: 'bun' })
      );
      expect(next.bun).toEqual(expect.objectContaining({ name: 'Soft Bun' }));
      expect(next.ingredients).toHaveLength(0);
    });

    it('addIngredient: добавляет не-булку с полями id, originId и uuid', () => {
      const start = { bun: null, ingredients: [] } as any;
      const next = constructorReducer(start, addIngredient(ingA));

      expect(next.ingredients).toHaveLength(1);
      const item: any = next.ingredients[0];
      expect(item.id).toBe(ingA._id);
      expect(item.originId).toBe(ingA._id);
      expect(typeof item.uuid).toBe('string');
      expect(item.name).toBe(ingA.name);
    });

    it('deleteIngredient: удаляет ингредиент по индексу', () => {
      const start = {
        bun: null,
        ingredients: [
          { id: '1', originId: '1', uuid: 'u1' },
          { id: '2', originId: '2', uuid: 'u2' }
        ]
      } as any;

      const next = constructorReducer(start, deleteIngredient(0));
      expect(next.ingredients).toHaveLength(1);
      expect((next.ingredients[0] as any).id).toBe('2');
    });

    it('moveIngredient: корректно перемещает элемент при валидных индексах', () => {
      const start = {
        bun: null,
        ingredients: [
          { id: '1', uuid: 'u1' },
          { id: '2', uuid: 'u2' },
          { id: '3', uuid: 'u3' }
        ]
      } as any;

      const next = constructorReducer(
        start,
        moveIngredient({ from: 0, to: 2 })
      );
      expect(next.ingredients.map((i: any) => i.id)).toEqual(['2', '3', '1']);
    });

    it('moveIngredient: игнорирует некорректные операции (same/negative/out-of-range)', () => {
      const start = {
        bun: null,
        ingredients: [
          { id: '1', uuid: 'u1' },
          { id: '2', uuid: 'u2' }
        ]
      } as any;

      const same = constructorReducer(
        start,
        moveIngredient({ from: 0, to: 0 })
      );
      expect(same.ingredients.map((i: any) => i.id)).toEqual(['1', '2']);

      const negative = constructorReducer(
        start,
        moveIngredient({ from: -1, to: 1 })
      );
      expect(negative.ingredients.map((i: any) => i.id)).toEqual(['1', '2']);

      const outOfRange = constructorReducer(
        start,
        moveIngredient({ from: 0, to: 10 })
      );
      expect(outOfRange.ingredients.map((i: any) => i.id)).toEqual(['1', '2']);
    });

    it('clearIngredient: очищает bun и ingredients', () => {
      const start = { bun: sampleBun, ingredients: [{ id: 'x' }] } as any;
      const next = constructorReducer(start, clearIngredient());
      expect(next.bun).toBeNull();
      expect(next.ingredients).toEqual([]);
    });
  });
});
