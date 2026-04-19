import { decodeJwtPayload } from './jwt';

function makeToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fakesig`;
}

describe('decodeJwtPayload', () => {
  it('decodes a valid JWT payload', () => {
    const payload = { sub: 'user-id-123', email: 'user@example.com', role: 'student' };
    const result = decodeJwtPayload(makeToken(payload));
    expect(result).toEqual(payload);
  });

  it('throws on a token with fewer than 3 parts', () => {
    expect(() => decodeJwtPayload('only.twoparts')).toThrow('Invalid JWT format');
  });

  it('throws when payload is missing required fields', () => {
    const token = makeToken({ sub: 'id' });
    expect(() => decodeJwtPayload(token)).toThrow();
  });

  it('throws when email field is not a valid email', () => {
    const token = makeToken({ sub: 'id', email: 'not-an-email', role: 'student' });
    expect(() => decodeJwtPayload(token)).toThrow();
  });
});
