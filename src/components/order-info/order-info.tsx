import { FC, useEffect, useMemo } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useParams } from 'react-router-dom';
import {
  getIngredients,
  getOrder,
  getOrderDetails,
  useDispatch,
  useSelector
} from '../../services/store';
import { fetchOrderInfo } from '../../services/orderInfoSlice';
import { fetchIngredients } from '../../services/ingredientsSlice';

export const OrderInfo: FC = () => {
  const orderData = useSelector(getOrderDetails);
  const ingredients = useSelector(getIngredients);

  const dispatch = useDispatch();
  const { number } = useParams();

  const fetchData = async () => {
    await dispatch(fetchIngredients());
    await dispatch(fetchOrderInfo(Number(number)));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
