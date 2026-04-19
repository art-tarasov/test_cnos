import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type TUser = { id: string; email: string; role: string };

interface IAuthState {
  user: TUser | null;
  token: string | null;
}

const USER_KEY = 'auth_user';
const TOKEN_KEY = 'auth_token';

function loadFromStorage(): IAuthState {
  try {
    const rawUser = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    return {
      user: rawUser !== null ? (JSON.parse(rawUser) as TUser) : null,
      token,
    };
  } catch {
    return { user: null, token: null };
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadFromStorage,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: TUser; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
      localStorage.setItem(TOKEN_KEY, action.payload.token);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    },
  },
});

export type { IAuthState, TUser };
export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
