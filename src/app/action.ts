'use server';
import {prisma} from '@/lib/prisma';
import bcrypt from 'bcrypt';
import {z} from 'zod';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {cookies} from 'next/headers';

type ResetPasswordPayload = {
  email: string;
  activationCode: string;
};

/**
 * Sends an order notification email via Resend when credentials are configured.
 */
async function sendResendEmail(payload: ResetPasswordPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = payload.email;

  if (!apiKey || !from || !to) {
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Şifre Sıfırlama Talebi`,
      text: `Merhaba,\n\nŞifre sıfırlama kodunuz: ${payload.activationCode}\n\nLütfen bu kodu güvenli bir yerde saklayın ve mümkünse giriş yaptıktan sonra değiştirin.\n\nİyi günler dileriz.`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend istegi basarisiz: ${response.status} ${errorText}`);
  }

  return true;
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Fetch user from DB by email (pseudo-code)
  const user = await prisma.user.findUnique({where: {email}});

  if (!user) return {error: 'User not found'};

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return {error: 'Invalid password'};

  // Create JWT session
  const payload = {id: user.id, email: user.email};
  const secret = process.env.JWT_SECRET || 'insecure_secret';
  const token = jwt.sign(payload, secret, {expiresIn: '2h'});

  // Set cookie (httpOnly, secure in production)
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 2, // 2 hours
    sameSite: 'lax',
  });

  return {success: true, user: {id: user.id, email: user.email}};
}

export async function sendPasswordResetEmail(formData: FormData) {
  const comingEmail = formData.get('email') as string;

  // Validate email format (basic check)
  const result = z.string().email().safeParse(comingEmail);
  if (!result.success) {
    return {error: 'Invalid email address'};
  }

  // Check if user exists
  const user = await prisma.user.findUnique({where: {email: comingEmail}});
  if (!user) {
    return {error: 'User not found'};
  }

  if (user.email !== comingEmail) {
    return {error: 'Email does not match our records'};
  }

  // Generate a six-digit numeric code for validation
  function generateSixDigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  const token = generateSixDigitCode();

  // Save the token to the user in the database
  const resultUser = await prisma.user.update({
    where: {email: comingEmail},
    data: {resetToken: token},
  });
  if (!resultUser) {
    return {error: 'Failed to set reset token'};
  }

  // Send the password reset email
  const emailResult = await sendResendEmail({
    email: comingEmail,
    activationCode: token,
  });
  if (!emailResult) {
    return {error: 'Failed to send password reset email'};
  }
  return {success: true, message: 'Password reset email sent'};
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string;
  const verificationCode = formData.get('verificationCode') as string;
  const newPassword = formData.get('newPassword') as string;

  // Validate email format (basic check)
  const result = z.string().email().safeParse(email);
  if (!result.success) {
    return {error: 'Invalid email address'};
  }

  // Check if user exists
  const user = await prisma.user.findUnique({where: {email}});
  if (!user) {
    return {error: 'User not found'};
  }

  // Check if the provided verification code matches the one in the database
  if (user.resetToken !== verificationCode) {
    return {error: 'Invalid verification code'};
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password and clear the reset token
  const updatedUser = await prisma.user.update({
    where: {email},
    data: {password: hashedPassword, resetToken: null},
  });

  if (!updatedUser) {
    return {error: 'Failed to reset password'};
  }
  return {success: true, message: 'Password has been reset successfully'};
}
