import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loginUserApi, TAuthResponse, registerUserApi } from '@api';
import { TUser } from '@utils-types';

interface IUserProfileState {
  isLoading: boolean;
  isAuthenticated: boolean;
  isRegistered: boolean;
  refreshToken: string;
  accessToken: string;
  user: TUser;
}

const initialState: IUserProfileState = {
  isLoading: false,
  isAuthenticated: false,
  isRegistered: false,
  refreshToken: '',
  accessToken: '',
  user: {
    name: '',
    email: ''
  }
};

export const userProfileSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<TAuthResponse>) => {
      state.isLoading = false;
      state.refreshToken = action.payload.refreshToken;
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = !!action.payload.accessToken;
    },
    fetchLoginStart: (state) => {
      state.isLoading = true;
      state.isRegistered = false;
    },
    fetchLoginError: (state) => {
      state.isLoading = false;
      state.isRegistered = false;
    },
    resetRegistration: (state) => {
      state.isRegistered = false;
    }
  }
});

export const login =
  (email: string, password: string) => async (dispatch: any) => {
    dispatch(userProfileSlice.actions.fetchLoginStart());
    try {
      const user = await loginUserApi({ email, password });
      dispatch(userProfileSlice.actions.setAuthenticated(user));
    } catch (error) {
      dispatch(userProfileSlice.actions.fetchLoginError());
    }
  };

// добавлен
export const register =
  (email: string, password: string, name: string) => async (dispatch: any) => {
    dispatch(userProfileSlice.actions.fetchLoginStart());
    try {
      const user = await registerUserApi({ email, password, name });
      dispatch(userProfileSlice.actions.setAuthenticated(user));
    } catch (error) {
      dispatch(userProfileSlice.actions.fetchLoginError());
    }
  };

export const {
  setAuthenticated,
  resetRegistration,
  fetchLoginStart,
  fetchLoginError
} = userProfileSlice.actions;
export default userProfileSlice.reducer;
