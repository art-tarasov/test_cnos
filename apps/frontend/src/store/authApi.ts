import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { z } from 'zod';
import type { RootState } from './index';

export const registerResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.string(),
});

export const loginResponseSchema = z.object({
  access_token: z.string(),
});

export type TRegisterResponse = z.infer<typeof registerResponseSchema>;
export type TLoginResponse = z.infer<typeof loginResponseSchema>;

type TRegisterRequest = { email: string; password: string };
type TLoginRequest = { email: string; password: string };

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL as string,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token !== null) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    register: builder.mutation<TRegisterResponse, TRegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: (raw) =>
        registerResponseSchema.parse(raw as unknown),
    }),
    login: builder.mutation<TLoginResponse, TLoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (raw) =>
        loginResponseSchema.parse(raw as unknown),
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation } = authApi;
