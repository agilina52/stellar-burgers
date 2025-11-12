import { FC, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { BurgerIngredientUI } from '@ui';
import { TBurgerIngredientProps } from './type';

import { useDispatch } from '../../services/store';
import { constructorSlice } from '../../services/constructorSlice';
import { setIngredientDetails } from '../../services/ingredientDetailsSlice';

export const BurgerIngredient: FC<TBurgerIngredientProps> = memo(
  ({ ingredient, count }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleAdd = () => {
      dispatch(constructorSlice.actions.addIngredient(ingredient));
    };
    //
    const handleClick = () => {
      console.log('Dispatching ingredient:', ingredient);

      dispatch(setIngredientDetails(ingredient));
      navigate(`/ingredients/${ingredient._id}`, {
        state: { background: location, additionalData: 'some data' },
        replace: false
      });
    };

    return (
      <BurgerIngredientUI
        ingredient={ingredient}
        count={count}
        locationState={{ background: location }}
        handleAdd={handleAdd}
        handleClick={handleClick}
      />
    );
  }
);
