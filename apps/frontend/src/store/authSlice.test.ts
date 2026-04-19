import authReducer, { setCredentials, clearCredentials } from './authSlice';

const mockUser = { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', email: 'test@example.com', role: 'student' };
const mockToken = 'test-jwt-token';

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null initial state when localStorage is empty', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('setCredentials stores user and token in state', () => {
    const state = authReducer(undefined, setCredentials({ user: mockUser, token: mockToken }));
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
  });

  it('setCredentials persists to localStorage', () => {
    authReducer(undefined, setCredentials({ user: mockUser, token: mockToken }));
    expect(localStorage.getItem('auth_token')).toBe(mockToken);
    expect(JSON.parse(localStorage.getItem('auth_user') ?? 'null')).toEqual(mockUser);
  });

  it('clearCredentials nulls out state', () => {
    let state = authReducer(undefined, setCredentials({ user: mockUser, token: mockToken }));
    state = authReducer(state, clearCredentials());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('clearCredentials removes entries from localStorage', () => {
    authReducer(undefined, setCredentials({ user: mockUser, token: mockToken }));
    authReducer(undefined, clearCredentials());
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});
