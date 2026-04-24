import {prisma} from '@/lib/prisma';
import {getSessionUser} from '../lib/session';
import {redirect} from 'next/navigation';
import {AdminLayoutWrapper} from './components/AdminLayoutWrapper';

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
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
