'use server';

import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {getUserFormValues, userSchema} from './schema';
import {prisma} from '@/lib/prisma';
import {revalidatePath} from 'next/cache';

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set('insektstop', '', {path: '/', expires: new Date(0)});
  redirect('/');
}

export async function updateUser(formData: FormData) {
  const submittedValues = getUserFormValues(formData);
  const validationResult = userSchema.safeParse(submittedValues);

  if (!validationResult.success) {
    return {
      ok: false,
      message: validationResult.error.issues[0].message,
    } as const;
  }

  const result = await prisma.user.update({
    where: {id: submittedValues.id},
    data: {
      name: submittedValues.name,
      email: submittedValues.email,
      phone: submittedValues.phone,
      address: submittedValues.address,
    },
  });

  if (!result) {
    return {
      ok: false,
      message: 'Kullanıcı güncellenirken bir hata oluştu',
    } as const;
  }
  revalidatePath('/admin');
  return {
    ok: true,
    message: 'Kullanıcı başarıyla güncellendi',
  } as const;
}
