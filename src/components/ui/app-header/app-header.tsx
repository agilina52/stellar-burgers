import React, { FC } from 'react';
import styles from './app-header.module.css';
import { TAppHeaderUIProps } from './type';
import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon
} from '@zlden/react-developer-burger-ui-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from '../../../services/store';

// export const AppHeaderUI: FC<TAppHeaderUIProps> = ({ userName }) => (
//   <header className={styles.header}>
//     <nav className={`${styles.menu} p-4`}>
//       <div className={styles.menu_part_left}>
//         <>
//           <BurgerIcon type={'primary'} />
//           <p className='text text_type_main-default ml-2 mr-10'>Конструктор</p>
//         </>
//         <>
//           <ListIcon type={'primary'} />
//           <p className='text text_type_main-default ml-2'>Лента заказов</p>
//         </>
//       </div>
//       <div className={styles.logo}>
//         <Logo className='' />
//       </div>
//       <div className={styles.link_position_last}>
//         <ProfileIcon type={'primary'} />
//         <p className='text text_type_main-default ml-2'>
//           {userName || 'Личный кабинет'}
//         </p>
//       </div>
//     </nav>
//   </header>
// );
export const AppHeaderUI: FC<TAppHeaderUIProps> = ({ userName }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // добавблено. Активные состояния для иконок
  const isConstructorActive = pathname === '/';
  const isFeedActive = pathname === '/feed';
  const isProfileActive = pathname.includes('/profile');

  // обработчик для профиля. Изменен
  const handleProfileClick = () => {
    if (!isAuthenticated) {
      navigate(`/login`);
    } else {
      navigate(`/profile`);
    }
    // if (pathname.includes('/profile')) {
    //   navigate('/');
    // }
  };
  // обработчик для конструктора
  const handleConstructorClick = () => {
    navigate(`/`);
  };
  // обработчик для ленты
  const handleFeedClick = () => {
    navigate(`/feed`);
  };
  const getIconType = (isActive: boolean) =>
    isActive ? 'primary' : 'secondary';
  // убрать лишнее

  //   return (
  //     <header className={styles.header}>
  //       <nav className={`${styles.menu} p-4`}>
  //         <div className={styles.menu_part_left}>
  //           <>
  //             <BurgerIcon type={'primary'} />
  //             <p className='text text_type_main-default ml-2 mr-10'>
  //               Конструктор
  //             </p>
  //           </>
  //           <>
  //             <ListIcon type={'primary'} />
  //             <p className='text text_type_main-default ml-2'>Лента заказов</p>
  //           </>
  //         </div>
  //         <div className={styles.logo}>
  //           <Logo className='' />
  //         </div>
  //         <div
  //           className={styles.link_position_last}
  //           onClick={handleProfileClick}
  //           style={{ cursor: 'pointer' }}
  //         >
  //           <ProfileIcon type={'primary'} />
  //           <p className='text text_type_main-default ml-2'>
  //             {userName || 'Личный кабинет'}
  //           </p>
  //         </div>
  //       </nav>
  //     </header>
  //   );
  // };

  return (
    <header className={styles.header}>
      <nav className={`${styles.menu} p-4`}>
        <div className={styles.menu_part_left}>
          <div
            className={`${styles.link} ${isConstructorActive ? styles.link_active : ''}`}
            onClick={handleConstructorClick}
            style={{ cursor: 'pointer' }}
          >
            <BurgerIcon type={getIconType(isConstructorActive)} />
            <p className='text text_type_main-default ml-2 mr-10'>
              Конструктор
            </p>
          </div>
          <div
            className={`${styles.link} ${isFeedActive ? styles.link_active : ''}`}
            onClick={handleFeedClick}
            style={{ cursor: 'pointer' }}
          >
            <ListIcon type={getIconType(isFeedActive)} />
            <p className='text text_type_main-default ml-2'>Лента заказов</p>
          </div>
        </div>
        <div className={styles.logo}>
          <Logo className='' />
        </div>
        <div
          className={`${styles.link} ${styles.link_position_last} ${isProfileActive ? styles.link_active : ''}`}
          onClick={handleProfileClick}
          style={{ cursor: 'pointer' }}
        >
          <ProfileIcon type={getIconType(isProfileActive)} />
          <p className='text text_type_main-default ml-2'>
            {userName || 'Личный кабинет'}
          </p>
        </div>
      </nav>
    </header>
  );
};
