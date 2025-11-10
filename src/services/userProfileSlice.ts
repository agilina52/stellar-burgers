import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  loginUserApi,
  TAuthResponse,
  registerUserApi,
  getUserApi,
  updateUserApi,
  getOrdersApi
} from '@api';
import { TUser } from '@utils-types';
import { setCookie } from '../utils/cookie';
import { logoutApi } from '@api';
import { TOrder } from '@utils-types';

interface IUserProfileState {
  isLoading: boolean;
  isAuthenticated: boolean;
  isRegistered: boolean;
  user: TUser;
  orders: TOrder[];
}

const initialState: IUserProfileState = {
  isLoading: false,
  isAuthenticated: false,
  isRegistered: false,
  user: {
    name: '',
    email: ''
  },
  orders: []
};

export const userProfileSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<TAuthResponse>) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.isAuthenticated =
        !!action.payload.user.name && !!action.payload.user.email;
    },
    fetchStart: (state) => {
      state.isLoading = true;
      state.isRegistered = false;
    },
    fetchError: (state) => {
      state.isLoading = false;
      state.isRegistered = false;
    },
    resetRegistration: (state) => {
      state.isRegistered = false;
    },
    setUser: (state, action: PayloadAction<TUser>) => {
      state.user = action.payload;
      console.log(action.payload);
      state.isAuthenticated = !!action.payload.name && !!action.payload.email;
    },
    setOrders: (state, action: PayloadAction<TOrder[]>) => {
      state.orders = action.payload;
    }
  }
});

export const login =
  (email: string, password: string) => async (dispatch: any) => {
    dispatch(userProfileSlice.actions.fetchStart());
    try {
      const data = await loginUserApi({ email, password });
      setCookie('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      dispatch(userProfileSlice.actions.setUser(data.user));
    } catch (error) {
      dispatch(userProfileSlice.actions.fetchError());
    }
  };

export const getUser = () => async (dispatch: any) => {
  dispatch(userProfileSlice.actions.fetchStart());
  try {
    const data = await getUserApi();
    dispatch(userProfileSlice.actions.setUser(data.user));
  } catch (error) {
    dispatch(userProfileSlice.actions.fetchError());
  }
};

export const register =
  (email: string, password: string, name: string) => async (dispatch: any) => {
    dispatch(userProfileSlice.actions.fetchStart());
    try {
      const user = await registerUserApi({ email, password, name });
      setCookie('accessToken', user.accessToken);
      localStorage.setItem('refreshToken', user.refreshToken);
      dispatch(userProfileSlice.actions.setUser(user.user));
    } catch (error) {
      dispatch(userProfileSlice.actions.fetchError());
    }
  };

export const updateProfile =
  (userData: { name?: string; email?: string; password?: string }) =>
  async (dispatch: any) => {
    dispatch(userProfileSlice.actions.fetchStart());
    try {
      const data = await updateUserApi(userData);
      dispatch(userProfileSlice.actions.setUser(data.user));
    } catch (error) {
      dispatch(userProfileSlice.actions.fetchError());
      throw error;
    }
  };

export const fetchUserOrders = () => async (dispatch: any) => {
  dispatch(userProfileSlice.actions.fetchStart());
  try {
    const data = await getOrdersApi();
    dispatch(userProfileSlice.actions.setOrders(data));
  } catch (error) {
    dispatch(userProfileSlice.actions.fetchError());
  }
};

export const logout = () => async (dispatch: any) => {
  try {
    await logoutApi();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    dispatch(userProfileSlice.actions.setUser({ name: '', email: '' }));
    setCookie('accessToken', '', { expires: -1 });
    localStorage.removeItem('refreshToken');
  }
};

export const {
  setAuthenticated,
  resetRegistration,
  fetchStart: fetchLoginStart,
  fetchError: fetchLoginError
} = userProfileSlice.actions;
export default userProfileSlice.reducer;
