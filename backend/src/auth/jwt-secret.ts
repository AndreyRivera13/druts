import { ConfigService } from '@nestjs/config';

/**
 * JWT_SECRET es obligatorio en todos los entornos.
 * No hay fallback (nunca se usa un valor como "secret").
 */
export function resolveJwtSecret(config: ConfigService): string {
  const secret = config.get<string>('JWT_SECRET')?.trim();
  if (!secret) {
    throw new Error(
      'JWT_SECRET no está definido. Configúralo en las variables de entorno.',
    );
  }
  return secret;
}
