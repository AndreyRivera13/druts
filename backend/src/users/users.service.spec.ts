import { ConflictException, NotFoundException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';

describe('UsersService.updateProfile', () => {
  let service: UsersService;
  let saved: User;
  const repo = {
    findOne: jest.fn(),
    save: jest.fn(async (user: User) => {
      saved = user;
      return user;
    }),
  };

  const existing = () =>
    Object.assign(new User(), {
      id: 'user-1',
      name: 'Juan',
      email: 'juan@druts.co',
      phone: '3000000000',
      address: 'Antigua',
      city: 'Bogotá',
      avatarUrl: null,
      role: UserRole.CUSTOMER,
      isActive: true,
      password: 'hash-bcrypt',
      totalPurchases: 3,
    });

  beforeEach(() => {
    repo.findOne.mockReset();
    repo.save.mockClear();
    saved = undefined;
    service = new UsersService(repo as any);
  });

  it('actualiza solo los campos permitidos y no cambia role, password ni isActive', async () => {
    const user = existing();
    repo.findOne.mockResolvedValue(user);

    const result = await service.updateProfile('user-1', {
      name: 'Juan Carlos',
      city: 'Cúcuta',
    });

    expect(result.name).toBe('Juan Carlos');
    expect(result.city).toBe('Cúcuta');
    expect(result.role).toBe(UserRole.CUSTOMER);
    expect(result.isActive).toBe(true);
    expect(result.password).toBe('hash-bcrypt');
    expect(result.totalPurchases).toBe(3);
    expect(result.email).toBe('juan@druts.co');
  });

  it('ignora intentos de mass assignment aunque se pasen campos extra al servicio', async () => {
    const user = existing();
    repo.findOne.mockResolvedValue(user);

    await service.updateProfile('user-1', {
      name: 'Ana',
      role: 'admin',
      password: 'hacked',
      isActive: false,
      id: 'otro-id',
    } as any);

    expect(saved.role).toBe(UserRole.CUSTOMER);
    expect(saved.password).toBe('hash-bcrypt');
    expect(saved.isActive).toBe(true);
    expect(saved.id).toBe('user-1');
    expect(saved.name).toBe('Ana');
  });

  it('rechaza un correo que ya está en uso por otro usuario', async () => {
    repo.findOne
      .mockResolvedValueOnce(existing())
      .mockResolvedValueOnce({ id: 'otro', email: 'ana@druts.co' });

    await expect(
      service.updateProfile('user-1', { email: 'ana@druts.co' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('lanza NotFound si el usuario no existe', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.updateProfile('missing', { name: 'X' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('User serialization', () => {
  it('excluye el hash de contraseña al serializar', () => {
    const user = Object.assign(new User(), {
      id: 'user-1',
      name: 'Juan',
      email: 'juan@druts.co',
      role: UserRole.CUSTOMER,
      password: '$2b$10$hashsupersecreto',
    });
    const plain = instanceToPlain(user);
    expect(plain.password).toBeUndefined();
    expect(plain.email).toBe('juan@druts.co');
    expect(plain.name).toBe('Juan');
  });
});
