import { Logger } from '@nestjs/common';

export type CorsOriginCallback = (
  err: Error | null,
  allow?: boolean,
) => void;

export type CorsOriginOption =
  | boolean
  | ((origin: string | undefined, cb: CorsOriginCallback) => void);

/**
 * En producción no se abre CORS a cualquier origen con credenciales.
 * Si hay FRONTEND_URL (lista separada por comas), solo se permiten esos orígenes.
 * En desarrollo, sin FRONTEND_URL, se refleja el origen de la petición
 * (`true`, no el literal "*") para no romper el trabajo local.
 */
export function parseAllowedOrigins(frontendUrl?: string): string[] {
  return (frontendUrl || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function buildCorsOrigin(
  frontendUrl: string | undefined,
  nodeEnv: string | undefined,
  logger: Pick<Logger, 'warn'> = new Logger('CORS'),
): CorsOriginOption {
  const allowed = parseAllowedOrigins(frontendUrl);
  const isProd = nodeEnv === 'production';

  if (allowed.length > 0) {
    return (origin, cb) => {
      if (!origin || allowed.includes(origin)) cb(null, true);
      else cb(new Error(`Origin ${origin} not allowed by CORS`));
    };
  }

  if (isProd) {
    logger.warn(
      'FRONTEND_URL no está definido en producción; CORS no aceptará orígenes de navegador con credenciales.',
    );
    return false;
  }

  return true;
}

export function shouldEnableSwagger(
  nodeEnv: string | undefined,
  enableSwagger?: string,
): boolean {
  return enableSwagger === 'true' || nodeEnv !== 'production';
}
