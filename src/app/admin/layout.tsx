import {prisma} from '@/lib/prisma';
import {getSessionUser} from '../lib/session';
import {AdminHeader} from './components/AdminHeader';
import {redirect} from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = (await getSessionUser()) as {email: string} | null;
  const user = await prisma.user.findFirst({
    where: {
      email: adminUser?.email,
    },
  });
  if (!user || !adminUser || adminUser.email !== user.email) {
    redirect('/'); // Admin değilse ana sayfaya yönlendir
  }
  return (
    <div className='min-h-screen bg-secondary'>
      <AdminHeader />
      {children}
    </div>
  );
}
