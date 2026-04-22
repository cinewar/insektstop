import {prisma} from '@/lib/prisma';
import {getSessionUser} from '../lib/session';
import {User} from './components/User';

export default async function AdminPage() {
  const adminUser = (await getSessionUser()) as {email: string} | null;
  const user = await prisma.user.findFirst({
    where: {
      email: adminUser?.email,
    },
  });
  if (!user) {
    return <div>User not found.</div>;
  }
  return (
    <>
      <User user={user} />
    </>
  );
}
