import {cookies} from 'next/headers';
import jwt from 'jsonwebtoken';

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  try {
    const secret = process.env.JWT_SECRET || 'insecure_secret';
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}
