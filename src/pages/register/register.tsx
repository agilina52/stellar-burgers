import { FC, SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterUI } from '@ui-pages';
import {
  useDispatch,
  useSelector,
  getUserProfileState
} from '../../services/store';
import { register } from '../../services/userProfileSlice';

export const Register: FC = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.user);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      await dispatch(register(email, password, userName));
    } catch (error) {
      console.error('Reg.error');
    }
  };

  return (
    <>
      {user.name}
      <RegisterUI
        errorText=''
        email={email}
        userName={userName}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        setUserName={setUserName}
        handleSubmit={handleSubmit}
      />
    </>
  );
};
