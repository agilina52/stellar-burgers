// import { ConstructorPage } from '@pages';
// import '../../index.css';
// import styles from './app.module.css';

// import { AppHeader } from '@components';

// const App = () => (
//   <div className={styles.app}>
//     <AppHeader />
//     <ConstructorPage />
//   </div>
// );

// export default App;

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

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // TODO: Заменить на реальную проверку из Redux
  const isAuthenticated = false;
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }
  return children;
};

// Компонент модального окна для заказов
const OrderModal = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const handleClose = () => {
    navigate(-1);
  };

  return (
    <Modal title='Детали заказа' onClose={handleClose}>
      {children}
    </Modal>
  );
};

// Компонент модального окна для ингредиентов
const IngredientModal = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const handleClose = () => {
    navigate(-1);
  };

  return (
    <Modal title='Детали ингредиента' onClose={handleClose}>
      {children}
    </Modal>
  );
};

const AppContent = () => (
  <div className={styles.app}>
    <AppHeader />
    <Routes>
      {/* Основные маршруты */}
      <Route path='/' element={<ConstructorPage />} />
      <Route path='/feed' element={<Feed />} />

      {/* Модальные маршруты */}
      <Route
        path='/feed/:number'
        element={
          <OrderModal>
            <OrderInfo />
          </OrderModal>
        }
      />
      <Route
        path='/ingredients/:id'
        element={
          <IngredientModal>
            <IngredientDetails />
          </IngredientModal>
        }
      />

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
            <OrderModal>
              <OrderInfo />
            </OrderModal>
          </ProtectedRoute>
        }
      />

      {/* 404 страница */}
      <Route path='*' element={<NotFound404 />} />
    </Routes>
  </div>
);

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
