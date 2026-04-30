import {prisma} from '@/lib/prisma';
import {ContactContent} from './ContactContent';

export default async function Contact() {
  const user = await prisma.user.findFirst({});

  return <>{user && <ContactContent user={user} />}</>;
}
