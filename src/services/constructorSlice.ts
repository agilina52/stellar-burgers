// import { orderBurgerApi } from '@api';
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { TIngredient, TConstructorIngredient } from '@utils-types';

// interface IConstructorState {
//   bun: {
//     price: number;
//     name: string;
//     image: string;
//     _id: string;
//   };
//   ingredients: TConstructorIngredient[];
// }

// const initialState: IConstructorState = {
//   bun: {
//     price: 0,
//     name: '',
//     image: '',
//     _id: ''
//   },
//   ingredients: []
// };

// export const constructorSlice = createSlice({
//   name: 'constructorBurger',
//   initialState,
//   reducers: {
//     setBun: (state, action: PayloadAction<TIngredient>) => {
//       state.bun = action.payload;
//     },
//     addIngredient: (state, action: PayloadAction<TIngredient>) => {
//       if (action.payload.type == 'bun') {
//         state.bun.price = action.payload.price;
//         state.bun.name = action.payload.name;
//         state.bun.image = action.payload.image;
//         state.bun._id = action.payload._id;
//       } else {
//         state.ingredients.push({ ...action.payload, id: action.payload._id });
//       }
//     },
//     clearIngredient: (state) => {
//       state.ingredients = [];
//       state.bun = { price: 0, name: '', image: '', _id: '' };
//     },
//     deleteIngredient: (state, action: PayloadAction<number>) => {
//       state.ingredients.splice(action.payload, 1);
//     },
//     // Новый редьюсер для перемещения ингредиента
//     moveIngredient: (
//       state,
//       action: PayloadAction<{ from: number; to: number }>
//     ) => {
//       const { from, to } = action.payload;
//       if (
//         from === to ||
//         from < 0 ||
//         to < 0 ||
//         from >= state.ingredients.length ||
//         to > state.ingredients.length
//       ) {
//         return;
//       }
//       const [moved] = state.ingredients.splice(from, 1);
//       state.ingredients.splice(to, 0, moved);
//     }
//   }
// });

// export const { setBun, clearIngredient, deleteIngredient, moveIngredient } =
//   constructorSlice.actions;
// export default constructorSlice.reducer;
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
        // присваиваем объект булки целиком
        state.bun = action.payload;
      } else {
        // генерируем локальный uuid для draggable и сохраняем originId
        const localId = nanoid();
        const constructorItem: TConstructorIngredient = {
          ...action.payload,
          id: action.payload._id, // поле id для совместимости
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
