import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import {
  getFeedOrdersState,
  useDispatch,
  useSelector
} from '../../services/store';
import { fetchFeed } from '../../services/feedSlice';
import { fetchIngredients } from '../../services/ingredientsSlice';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(getFeedOrdersState);

  const fetchData = async () => {
    await dispatch(fetchIngredients());
    await dispatch(fetchFeed());
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!orders.length) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={fetchData} />;
};
