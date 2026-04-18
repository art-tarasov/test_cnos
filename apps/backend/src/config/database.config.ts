export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export function loadDatabaseConfig(): DatabaseConfig {
  const host = process.env['DB_HOST'];
  const port = process.env['DB_PORT'];
  const username = process.env['DB_USER'];
  const password = process.env['DB_PASSWORD'];
  const database = process.env['DB_NAME'];

  if (!host || !username || !password || !database) {
    throw new Error(
      'Missing required database environment variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME',
    );
  }

  return {
    host,
    port: port !== undefined ? parseInt(port, 10) : 5432,
    username,
    password,
    database,
  };
}
