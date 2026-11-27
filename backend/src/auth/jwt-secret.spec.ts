import { ConfigService } from '@nestjs/config';
import { resolveJwtSecret } from './jwt-secret';

describe('resolveJwtSecret', () => {
  it('devuelve el secreto configurado', () => {
    const config = { get: jest.fn().mockReturnValue('  una-clave-larga  ') } as unknown as ConfigService;
    expect(resolveJwtSecret(config)).toBe('una-clave-larga');
  });

  it('falla si JWT_SECRET no está definido', () => {
    const config = { get: jest.fn().mockReturnValue(undefined) } as unknown as ConfigService;
    expect(() => resolveJwtSecret(config)).toThrow(/JWT_SECRET no está definido/);
  });

  it('falla si JWT_SECRET es una cadena vacía', () => {
    const config = { get: jest.fn().mockReturnValue('   ') } as unknown as ConfigService;
    expect(() => resolveJwtSecret(config)).toThrow(/JWT_SECRET no está definido/);
  });

  it('no usa el fallback inseguro "secret"', () => {
    const config = { get: jest.fn().mockReturnValue(undefined) } as unknown as ConfigService;
    try {
      resolveJwtSecret(config);
      fail('debería lanzar');
    } catch (e) {
      expect((e as Error).message).not.toMatch(/^secret$/);
    }
  });
});
