import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegisterMutation } from '../store/authApi';
import { ROUTES } from '../constants/routes';

export default function RegisterPage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    try {
      await register({ email, password }).unwrap();
      void navigate(ROUTES.LOGIN);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 409) {
        setError(t('auth.errors.emailTaken'));
      } else {
        setError(t('auth.errors.genericError'));
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          {t('auth.register.title')}
        </h1>
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('auth.register.emailLabel')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.register.emailPlaceholder')}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('auth.register.passwordLabel')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.register.passwordPlaceholder')}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          {error !== null && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {t('auth.register.submitButton')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          <Link to={ROUTES.LOGIN} className="text-indigo-600 hover:underline">
            {t('auth.register.loginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
