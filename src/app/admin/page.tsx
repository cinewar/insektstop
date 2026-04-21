import {prisma} from '@/lib/prisma';
import {getSessionUser} from '../lib/session';
import {redirect} from 'next/navigation';
import {User} from './components/User';

export default async function AdminPage() {
  const adminUser = (await getSessionUser()) as {email: string} | null;
  console.log('Admin user:', adminUser);
  const user = await prisma.user.findFirst({
    where: {
      email: adminUser?.email,
    },
  });
  if (!user || !adminUser || adminUser.email !== user.email) {
    redirect('/'); // Admin değilse ana sayfaya yönlendir
  }

  return (
    <>
      <User user={user} />
    </>
  );
}
