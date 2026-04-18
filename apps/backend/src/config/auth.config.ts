export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
}

export function loadAuthConfig(): AuthConfig {
  const jwtSecret = process.env['JWT_SECRET'];
  const jwtExpiresIn = process.env['JWT_EXPIRES_IN'] ?? '7d';

  if (!jwtSecret) {
    throw new Error('Missing required auth environment variable: JWT_SECRET');
  }

  return { jwtSecret, jwtExpiresIn };
}
