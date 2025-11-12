import { useSelector } from '../../services/store';
import { getUserProfileState } from '../../services/store';
import styles from './constructor-page.module.css';

import { BurgerIngredients } from '../../components';
import { BurgerConstructor } from '../../components';
import { Preloader } from '../../components/ui';
import { FC } from 'react';

export const ConstructorPage: FC = () => {
  /** TODO: взять переменную из стора */
  const isIngredientsLoading = false;

  // добавлен
  // const user = useSelector(getUserProfileState);
  // const isAuthenticated = !!user?.name;

  return (
    <>
      {isIngredientsLoading ? (
        <Preloader />
      ) : (
        <main className={styles.containerMain}>
          <h1
            className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}
          >
            Соберите бургер
          </h1>
          <div className={`${styles.main} pl-5 pr-5`}>
            <BurgerIngredients />
            <BurgerConstructor />
          </div>
        </main>
      )}
    </>
  );
};

// import { useSelector, useDispatch } from '../../services/store';
// import { fetchIngredients } from '../../services/ingredientsSlice';
// import { TIngredient } from '@utils-types';

// import styles from './constructor-page.module.css';
// import { BurgerIngredients } from '../../components';
// import { BurgerConstructor } from '../../components';
// import { Preloader } from '../../components/ui';
// import { FC, useEffect } from 'react';
// import { RootState } from '../../services/store';

// export const ConstructorPage: FC = () => {
//   /** TODO: взять переменную из стора */
//   const dispatch = useDispatch();
//   const isIngredientsLoading = useSelector(
//     (state: RootState) => state.ingredients.isLoading
//   );
//   const ingredients: TIngredient[] = useSelector(
//     (state: RootState) => state.ingredients.items
//   );

//   useEffect(() => {
//     dispatch(fetchIngredients());
//   }, [dispatch]);
//   return (
//     <>
//       {isIngredientsLoading ? (
//         <Preloader />
//       ) : (
//         <main className={styles.containerMain}>
//           <h1
//             className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}
//           >
//             Соберите бургер
//           </h1>
//           <div className={`${styles.main} pl-5 pr-5`}>
//             <BurgerIngredients />
//             <BurgerConstructor />
//           </div>
//         </main>
//       )}
//     </>
//   );
// };
