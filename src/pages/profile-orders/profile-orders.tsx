import { ProfileOrdersUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { getUserOrders, useDispatch, useSelector } from '../../services/store';
import { fetchUserOrders } from '../../services/userProfileSlice';
import { fetchIngredients } from '../../services/ingredientsSlice';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  /** TODO: взять переменную из стора */
  // const orders: TOrder[] = [];
  const orders = useSelector(getUserOrders);

  const fetchData = async () => {
    await dispatch(fetchIngredients());
    await dispatch(fetchUserOrders());
  };

  useEffect(() => {
    fetchData();
  }, []);

  return <ProfileOrdersUI orders={orders} />;
};
