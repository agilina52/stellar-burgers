import { FC, memo } from 'react';
import { BurgerConstructorElementUI } from '@ui';
import { BurgerConstructorElementProps } from './type';
import { useDispatch } from '../../services/store';
import {
  deleteIngredient,
  moveIngredient
} from '../../services/constructorSlice';

export const BurgerConstructorElement: FC<
  BurgerConstructorElementProps & { 'data-testid'?: string }
> = memo(({ ingredient, index, totalItems, 'data-testid': dataTestId }) => {
  const dispatch = useDispatch();

  const handleMoveDown = () => {
    if (index < totalItems - 1) {
      dispatch(moveIngredient({ from: index, to: index + 1 }));
    }
  };
  const handleMoveUp = () => {
    if (index > 0) {
      dispatch(moveIngredient({ from: index, to: index - 1 }));
    }
  };

  const handleClose = () => {
    dispatch(deleteIngredient(index));
  };

  return (
    <BurgerConstructorElementUI
      data-testid={dataTestId}
      ingredient={ingredient}
      index={index}
      totalItems={totalItems}
      handleMoveUp={handleMoveUp}
      handleMoveDown={handleMoveDown}
      handleClose={handleClose}
    />
  );
});
