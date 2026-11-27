import { buildCorsOrigin, parseAllowedOrigins, shouldEnableSwagger } from './cors';

describe('parseAllowedOrigins', () => {
  it('parte una lista separada por comas', () => {
    expect(parseAllowedOrigins('https://a.com, https://b.com')).toEqual([
      'https://a.com',
      'https://b.com',
    ]);
  });

  it('devuelve vacío si no hay valor', () => {
    expect(parseAllowedOrigins(undefined)).toEqual([]);
    expect(parseAllowedOrigins('')).toEqual([]);
  });
});

describe('buildCorsOrigin', () => {
  const logger = { warn: jest.fn() };

  beforeEach(() => logger.warn.mockClear());

  it('en producción sin FRONTEND_URL no abre cualquier origen', () => {
    expect(buildCorsOrigin(undefined, 'production', logger)).toBe(false);
    expect(logger.warn).toHaveBeenCalled();
  });

  it('en desarrollo sin FRONTEND_URL refleja el origen (true, no "*")', () => {
    expect(buildCorsOrigin(undefined, 'development', logger)).toBe(true);
  });

  it('permite solo los orígenes de FRONTEND_URL', (done) => {
    const origin = buildCorsOrigin('https://tienda.com,https://admin.com', 'production', logger);
    expect(typeof origin).toBe('function');
    if (typeof origin !== 'function') return;
    origin('https://tienda.com', (err, allow) => {
      expect(err).toBeNull();
      expect(allow).toBe(true);
      origin('https://evil.com', (err2) => {
        expect(err2).toBeInstanceOf(Error);
        done();
      });
    });
  });

  it('permite peticiones sin Origin (mismo origen / herramientas)', (done) => {
    const origin = buildCorsOrigin('https://tienda.com', 'production', logger);
    if (typeof origin !== 'function') return;
    origin(undefined, (err, allow) => {
      expect(err).toBeNull();
      expect(allow).toBe(true);
      done();
    });
  });
});

describe('shouldEnableSwagger', () => {
  it('está desactivado en producción por defecto', () => {
    expect(shouldEnableSwagger('production')).toBe(false);
  });

  it('se puede forzar en producción con ENABLE_SWAGGER=true', () => {
    expect(shouldEnableSwagger('production', 'true')).toBe(true);
  });

  it('está activo fuera de producción', () => {
    expect(shouldEnableSwagger('development')).toBe(true);
    expect(shouldEnableSwagger('test')).toBe(true);
    expect(shouldEnableSwagger(undefined)).toBe(true);
  });
});
