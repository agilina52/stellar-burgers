import { FC, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';
import {
  setIngredientDetails,
  clearIngredientDetails
} from '../../services/ingredientDetailsSlice';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { fetchIngredients } from '../../services/ingredientsSlice';

// export const IngredientDetails: FC = () => {
//   /** TODO: взять переменную из стора */
//   const { ingredientData } = useSelector((state) => state.ingredientDetails);

//   if (!ingredientData) {
//     return <Preloader />;
//   }

//   return <IngredientDetailsUI ingredientData={ingredientData} />;
// };

export const IngredientDetails: FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { ingredient } = useSelector((state) => state.ingredientDetails);

  const { items: allIngredients, isLoading } = useSelector(
    (state) => state.ingredients
  );

  useEffect(() => {
    console.log(id, allIngredients.length);
    if (id && allIngredients.length > 0) {
      // Ищем ингредиент только когда список загружен
      const foundIngredient = allIngredients.find((ing) => ing._id === id);
      if (foundIngredient) {
        dispatch(setIngredientDetails(foundIngredient));
      }
    }
  }, [id, allIngredients, dispatch]);

  useEffect(
    () => () => {
      dispatch(clearIngredientDetails());
      dispatch(fetchIngredients());
    },
    []
  );

  // Показываем прелоадер если ингредиенты еще загружаются
  if (isLoading || !allIngredients.length) {
    return <Preloader />;
  }

  if (!ingredient) {
    return <div>Ингредиент не найден</div>;
  }

  return (
    <div className='center-component'>
      <IngredientDetailsUI ingredientData={ingredient} />
    </div>
  );
};
