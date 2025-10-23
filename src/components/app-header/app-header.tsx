import { FC } from 'react';
import { useSelector, getUserProfileState } from '../../services/store';
import { AppHeaderUI } from '@ui';

export const AppHeader: FC = () => {
  const user = useSelector(getUserProfileState);
  return <AppHeaderUI userName={user.name} />;
};
