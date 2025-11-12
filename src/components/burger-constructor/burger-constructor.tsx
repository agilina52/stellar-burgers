import { FC, useMemo } from 'react';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import {
  useSelector,
  getBurgerConstructorState,
  useDispatch,
  getOrder,
  getOrderRequestState
} from '../../services/store';
import { clearOrder, createOrder } from '../../services/orderSlice';
import { clearIngredient } from '../../services/constructorSlice';
import { useNavigate } from 'react-router-dom';
import { TConstructorItems } from '@utils-types';

export const BurgerConstructor: FC = () => {
  const orderRequest = useSelector(getOrderRequestState);
  const orderModalData = useSelector(getOrder);
  const constructorItems = useSelector(getBurgerConstructorState);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const navigate = useNavigate();

  const onOrderClick = () => {
    if (!isAuthenticated) {
      navigate(`/login`);
      return;
    }
    const ingredientIds = constructorItems.ingredients.map((item) => item._id);

    if (constructorItems.bun) {
      ingredientIds.push(constructorItems.bun._id);
      ingredientIds.push(constructorItems.bun._id);
    }

    dispatch(createOrder(ingredientIds));
  };
  const closeOrderModal = () => {
    dispatch(clearOrder());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  // return null;

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems as TConstructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
