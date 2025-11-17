import { TOrder } from '@utils-types';

// добавлен тип, смотреть FeedInfo.stories.ts
export type TFeed = {
  orders: TOrder[];
  total: number;
  isLoading: boolean;
  totalToday: number;
};

// заменен на добавленный тип
export type FeedInfoUIProps = {
  feed: TFeed;
  readyOrders: number[];
  pendingOrders: number[];
};

export type HalfColumnProps = {
  orders: number[];
  title: string;
  textColor?: string;
};

export type TColumnProps = {
  title: string;
  content: number;
};
