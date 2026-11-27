import { ValidationPipe } from '@nestjs/common';
import { UpdateProfileDto } from './update-profile.dto';

describe('UpdateProfileDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  async function transform(value: unknown) {
    return pipe.transform(value, { type: 'body', metatype: UpdateProfileDto });
  }

  it('acepta solo campos seguros del perfil', async () => {
    const result = await transform({
      name: 'Ana',
      email: 'ana@example.com',
      phone: '3001112233',
      address: 'Calle 1',
      city: 'Cúcuta',
      avatarUrl: 'https://cdn.example/a.png',
    });
    expect(result).toEqual({
      name: 'Ana',
      email: 'ana@example.com',
      phone: '3001112233',
      address: 'Calle 1',
      city: 'Cúcuta',
      avatarUrl: 'https://cdn.example/a.png',
    });
  });

  it('rechaza role, password, isActive, id y totalPurchases', async () => {
    const forbidden = [
      { role: 'admin' },
      { password: 'NuevaClave1!' },
      { isActive: false },
      { id: '00000000-0000-0000-0000-000000000001' },
      { totalPurchases: 999 },
      { name: 'Ana', role: 'admin' },
    ];

    for (const body of forbidden) {
      await expect(transform(body)).rejects.toThrow();
    }
  });

  it('rechaza un email inválido', async () => {
    await expect(transform({ email: 'no-es-email' })).rejects.toThrow();
  });

  it('acepta un cuerpo vacío (todos los campos son opcionales)', async () => {
    const result = await transform({});
    expect(result).toEqual({});
  });
});
