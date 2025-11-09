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

export const BurgerConstructor: FC = () => {
  /** TODO: взять переменные constructorItems, orderRequest и orderModalData из стора */
  // const constructorItems = {
  //   bun: {
  //     price: 0
  //   },
  //   ingredients: []
  // };

  const orderRequest = useSelector(getOrderRequestState);
  const orderModalData = useSelector(getOrder);
  const constructorItems = useSelector(getBurgerConstructorState);
  const dispatch = useDispatch();

  const onOrderClick = () => {
    // if (!constructorItems.bun || orderRequest) return;
    // TODO: jkj
    const ingredientIds = constructorItems.ingredients.map((item) => item._id);
    ingredientIds.push(constructorItems.bun._id);
    ingredientIds.push(constructorItems.bun._id);

    dispatch(createOrder(ingredientIds));
  };
  const closeOrderModal = () => {
    dispatch(clearOrder());
    dispatch(clearIngredient());
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
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
