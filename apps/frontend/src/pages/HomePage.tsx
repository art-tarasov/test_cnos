import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { clearCredentials } from '../store/authSlice';
import { ROUTES } from '../constants/routes';

export default function HomePage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  function handleLogout(): void {
    dispatch(clearCredentials());
    void navigate(ROUTES.LOGIN);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('home.welcome', { email: user?.email ?? '' })}
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
        >
          {t('home.logoutButton')}
        </button>
      </div>
    </div>
  );
}
