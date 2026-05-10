'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(3, 'Nombre mínimo 3 caracteres'),
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Contraseña mínima 6 caracteres'),
  phone: z.string().optional(),
  city: z.string().optional(),
});

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data: any) => {
    try {
      await registerUser(data);
      toast.success('¡Cuenta creada! Bienvenido');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrarse');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="label-eyebrow mb-3">Bienvenido</p>
          <h1 className="font-serif text-3xl text-ink">Crear cuenta</h1>
          <p className="text-gray-500 mt-2 text-sm font-light">Únete a la comunidad DRUTS</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: 'name', label: 'Nombre completo', placeholder: 'Juan Pérez', type: 'text' },
              { name: 'email', label: 'Correo electrónico', placeholder: 'tu@email.com', type: 'email' },
              { name: 'password', label: 'Contraseña', placeholder: '••••••••', type: 'password' },
              { name: 'phone', label: 'Teléfono (opcional)', placeholder: '3001234567', type: 'tel' },
              { name: 'city', label: 'Ciudad (opcional)', placeholder: 'Cúcuta', type: 'text' },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  {...register(field.name as any)}
                  type={field.type}
                  className="input"
                  placeholder={field.placeholder}
                />
                {errors[field.name as keyof typeof errors] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors[field.name as keyof typeof errors]?.message as string}
                  </p>
                )}
              </div>
            ))}

            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-primary-600 font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
