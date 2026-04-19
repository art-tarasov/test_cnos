import { registerResponseSchema, loginResponseSchema } from './authApi';

describe('registerResponseSchema', () => {
  it('accepts a valid register response', () => {
    const valid = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      email: 'user@example.com',
      role: 'student',
    };
    expect(registerResponseSchema.parse(valid)).toEqual(valid);
  });

  it('rejects a missing id', () => {
    expect(() =>
      registerResponseSchema.parse({ email: 'user@example.com', role: 'student' }),
    ).toThrow();
  });

  it('rejects a non-uuid id', () => {
    expect(() =>
      registerResponseSchema.parse({ id: 'not-a-uuid', email: 'user@example.com', role: 'student' }),
    ).toThrow();
  });

  it('rejects an invalid email', () => {
    expect(() =>
      registerResponseSchema.parse({ id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', email: 'bad-email', role: 'student' }),
    ).toThrow();
  });

  it('rejects a missing role', () => {
    expect(() =>
      registerResponseSchema.parse({ id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', email: 'user@example.com' }),
    ).toThrow();
  });
});

describe('loginResponseSchema', () => {
  it('accepts a valid login response', () => {
    const valid = { access_token: 'some.jwt.token' };
    expect(loginResponseSchema.parse(valid)).toEqual(valid);
  });

  it('rejects a missing access_token', () => {
    expect(() => loginResponseSchema.parse({})).toThrow();
  });

  it('rejects a non-string access_token', () => {
    expect(() => loginResponseSchema.parse({ access_token: 123 })).toThrow();
  });
});
