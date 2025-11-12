import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate
} from 'react-router-dom';
import { ConstructorPage } from '@pages';
import {
  Feed,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Profile,
  ProfileOrders,
  NotFound404
} from '@pages';
import { AppHeader, Modal, IngredientDetails, OrderInfo } from '@components';

import '../../index.css';
import styles from './app.module.css';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { getUser } from '../../services/userProfileSlice';
import { ProtectedRoute } from '../protectedRoute';
import { BurgerModal } from '../burgerModal';

// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
//   const dispatch = useDispatch();
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         await dispatch(getUser());
//       } catch (error) {
//         console.error('Auth check failed:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkAuth();
//   }, [dispatch]);

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   return isAuthenticated ? <>{children}</> : <Navigate to='/login' replace />;
// };

// const BurgerModal = ({
//   children,
//   title
// }: {
//   children: React.ReactNode;
//   title: string;
// }) => {
//   const navigate = useNavigate();
//   const handleClose = () => {
//     navigate(-1);
//   };
//   return (
//     <Modal title={title} onClose={handleClose}>
//       {children}
//     </Modal>
//   );
// };

const AppContent = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const background = location.state?.background;

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />

      <Routes location={background || location}>
        {/* Основные маршруты */}
        <Route path='/' element={<ConstructorPage />} />
        <Route path='/feed' element={<Feed />} />
        {/* СТРАНИЦЫ (не модальные) для прямых ссылок */}
        <Route path='/ingredients/:id' element={<IngredientDetails />} />
        <Route path='/feed/:number' element={<OrderInfo />} />

        {/* Маршруты авторизации */}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />

        {/* Защищённые маршруты */}
        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile/orders'
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile/orders/:number'
          element={
            <ProtectedRoute>
              <OrderInfo />
            </ProtectedRoute>
          }
        />

        {/* 404 страница */}
        <Route path='*' element={<NotFound404 />} />
      </Routes>

      {/* модальные окна - рендерятся только когда есть backgroundLocation */}
      {background && (
        <Routes>
          <Route
            path='/ingredients/:id'
            element={
              <BurgerModal title='Детали ингредиента'>
                <IngredientDetails />
              </BurgerModal>
            }
          />
          <Route
            path='/feed/:number'
            element={
              <BurgerModal title='Детали заказа'>
                <OrderInfo />
              </BurgerModal>
            }
          />
          <Route
            path='/profile/orders/:number'
            element={
              <ProtectedRoute>
                <BurgerModal title='Детали заказа'>
                  <OrderInfo />
                </BurgerModal>
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
