# Release 0.6.0

## Outcome

Coherence delta: C_Σ `A` (`α A`, `β A`, `γ —`) · **Level:** `L6`

The frontend foundation is now operational. The React scaffold has grown into a navigable application with typed route constants, Redux state management, RTK Query API abstraction, Zod-validated responses, authentication UI (register and login pages), a protected home page, internationalization infrastructure, and Tailwind styling. The frontend can now consume backend API endpoints and persist/restore user session state. The auth system is complete end-to-end: backend issues JWTs (0.3.0), frontend decodes and stores them (0.6.0), and RTK Query injects them into outbound requests.

## Why it matters

The project existed as a usable backend and an empty React scaffold. This cycle closes that gap: the application is now runnable end-to-end for the happy path (register → login → see home page). No UI feature work was previously possible; all future UI cycles (quiz authoring, quiz participation, admin tools, etc.) now have a stable foundation to build on. Single-source-of-truth routes and i18n infrastructure prevent common frontend drift problems. Zod validation at the API boundary catches response shape violations early (structural vs runtime). LocalStorage persistence and Redux hydration allow users to refresh without losing session state.

## Fixed

None — this is a new feature cycle.

## Added

- **Route constants** (#12): `src/constants/routes.ts` exports ROUTES const with HOME, LOGIN, REGISTER. All navigation via `navigate(ROUTES.*)` — no hardcoded path strings anywhere in source.
- **Redux store** (#12): Redux Toolkit configureStore with authSlice and authApi. Store exported from `src/store/index.ts`. Provider wraps app root. RootState and AppDispatch types exported for usage throughout the app.
- **Auth API (RTK Query)** (#12): `authApi` service with `register` and `login` mutations. Zod schemas (`registerResponseSchema`, `loginResponseSchema`) validate responses at `transformResponse` boundary. Response types derived via `z.infer<>` — no manual type duplication.
- **Auth state** (#12): `authSlice` with `IAuthState { user, token }` shape. Actions: `setCredentials(user, token)` and `clearCredentials()`. Both sync to/from localStorage (USER_KEY, TOKEN_KEY). `loadFromStorage()` hydrates on store initialization.
- **Registration UI** (#12): Form at `/register` with email/password inputs. Calls `useRegisterMutation`. Success → navigate to `/login`. 409 conflict → display `t('auth.errors.emailTaken')`. All labels and errors translated.
- **Login UI** (#12): Form at `/login` with email/password inputs. Calls `useLoginMutation`. JWT decoded via `decodeJwtPayload` (Zod-validated, checks 3-part structure and payload schema). Success → dispatch `setCredentials` with decoded user info → navigate to `/`. 401 error → display `t('auth.errors.invalidCredentials')`. All labels and errors translated.
- **Home page** (#12): Protected page at `/` (auth-required). Displays "Welcome, {email}" from Redux state. Logout button dispatches `clearCredentials()` and navigates to `/login`. Unauthenticated users redirected to `/login` by ProtectedRoute.
- **ProtectedRoute component** (#12): HOC that checks Redux `auth.token`. If null, redirects to `/login`. Otherwise renders children. Used to protect the home page.
- **Internationalization** (#12): i18next + react-i18next configured. English translations in `src/locales/en/translation.json`. Keys: `auth.login.*`, `auth.register.*`, `auth.errors.*`, `home.*`. Every user-visible string uses `t()` hook — no hardcoded strings in JSX.
- **Tailwind CSS** (#12): Installed and configured. `tailwind.config.js` content paths cover `./src/**/*.{ts,tsx}`. All pages styled with utility classes. `index.css` imports Tailwind base. No separate CSS files or CSS modules.
- **JWT decoding utility** (#12): `src/utils/jwt.ts` exports `decodeJwtPayload(token)`. Validates token structure (3 parts), base64-decodes the payload, and parses via Zod schema. Throws on format mismatch or schema violation.
- **Environment configuration** (#12): RTK Query baseQuery reads `VITE_API_URL` from env. `prepareHeaders` injects Bearer token from Redux auth state into outbound requests. `.env.example` documents VITE_API_URL.
- **Type safety** (#12): `tsconfig.json` strict: true, noEmit: true. No `any` type in source. All API response types via `z.infer<>` (TRegisterResponse, TLoginResponse). Naming conventions: IAuthState (interface), T-prefix for Zod types, ROUTES (const), E/I/T prefixes respected.
- **Unit tests** (#12): 19 tests across 4 suites — authApi schemas (8 tests: valid/invalid register and login responses), authSlice (5 tests: setCredentials, clearCredentials, localStorage persistence), jwt utility (4 tests: valid decode, invalid format, missing fields, bad email), ProtectedRoute (2 tests: authenticated/unauthenticated rendering). All 19/19 pass.

## Changed

None.

## Removed

None.

## Validation

- 19/19 tests pass (`npm test` in `apps/frontend`).
- `tsc --noEmit` exits 0 — no type errors, no `any` introduced.
- All route paths defined in ROUTES const; zero hardcoded path strings found in source.
- All user-visible strings via `t()` hook; no hardcoded English text in JSX.
- No hardcoded API URLs; VITE_API_URL required at runtime.
- localStorage persistence tested: setCredentials and clearCredentials both verified to write/remove keys.
- JWT payload validation tested: decode rejects invalid format (2-part tokens) and schema violations (missing fields, invalid email).

## Known Issues

- Password field on login form does not clear on error — deferred to future UX polish cycle.
- localStorage hydration cannot be unit-tested without module re-import machinery — covered implicitly by setCredentials/clearCredentials persistence tests.
- JWT decoded client-side (base64 + Zod) to populate auth state from login response; server-side validation of the token remains the authority (no `/auth/me` endpoint in this cycle).
