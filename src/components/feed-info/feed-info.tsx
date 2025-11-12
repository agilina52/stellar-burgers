import { FC } from 'react';

import { TOrder } from '@utils-types';
import { FeedInfoUI } from '../ui/feed-info';
import { getFeedState, useDispatch, useSelector } from '../../services/store';

const getOrders = (orders: TOrder[], status: string): number[] =>
  orders
    .filter((item) => item.status === status)
    .map((item) => item.number)
    .slice(0, 20);

export const FeedInfo: FC = () => {
  /** TODO: взять переменные из стора */
  // селектором вытащить  из стейта getFeedState нужные ключи
  const dispatch = useDispatch();
  const { orders, total, totalToday } = useSelector((state) => state.feed);
  // const orders: TOrder[] = [];
  //{ total, totalToday }
  const feed = { total, totalToday };

  const readyOrders = getOrders(orders, 'done');

  const pendingOrders = getOrders(orders, 'pending');

  return (
    <FeedInfoUI
      readyOrders={readyOrders}
      pendingOrders={pendingOrders}
      feed={feed}
    />
  );
};
