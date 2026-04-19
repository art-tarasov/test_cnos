import { z } from 'zod';

const jwtPayloadSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  role: z.string(),
});

export type TJwtPayload = z.infer<typeof jwtPayloadSchema>;

export function decodeJwtPayload(token: string): TJwtPayload {
  const parts = token.split('.');
  const encoded = parts[1];
  if (parts.length !== 3 || encoded === undefined) {
    throw new Error('Invalid JWT format');
  }
  const raw: unknown = JSON.parse(atob(encoded));
  return jwtPayloadSchema.parse(raw);
}
