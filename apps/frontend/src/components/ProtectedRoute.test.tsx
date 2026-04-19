import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import ProtectedRoute from './ProtectedRoute';

function makeStore(token: string | null) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: token !== null ? { id: 'uid', email: 'u@example.com', role: 'student' } : null,
        token,
      },
    },
  });
}

function renderWithProviders(token: string | null) {
  const store = makeStore(token);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected content</div>
        </ProtectedRoute>
      </MemoryRouter>
    </Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('does not render children when unauthenticated', () => {
    renderWithProviders(null);
    expect(screen.queryByText('Protected content')).toBeNull();
  });

  it('renders children when authenticated', () => {
    renderWithProviders('valid-token');
    expect(screen.getByText('Protected content')).toBeDefined();
  });
});
