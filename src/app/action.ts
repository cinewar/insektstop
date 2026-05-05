'use server';
import {prisma} from '@/lib/prisma';
import bcrypt from 'bcrypt';
import {z} from 'zod';
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
      subject: `Anfrage zum Zurücksetzen des Passworts für Insektstop`,
      text: `Hallo,\n\nIhr Passwort-Zurücksetzungscode lautet: ${payload.activationCode}\n\nBitte bewahren Sie diesen Code an einem sicheren Ort auf und ändern Sie Ihr Passwort nach Möglichkeit nach der Anmeldung.\n\nMit freundlichen Grüßen.`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erneutes Senden fehlgeschlagen: ${response.status} ${errorText}`,
    );
  }

  return true;
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Fetch user from DB by email (pseudo-code)
  const user = await prisma.user.findUnique({where: {email}});

  if (!user) return {error: 'Benutzer nicht gefunden'};

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return {error: 'Ungültiges Passwort'};

  // Create JWT session
  const payload = {id: user.id, email: user.email};
  const secret = process.env.JWT_SECRET || 'insecure_secret';
  const token = jwt.sign(payload, secret, {expiresIn: '2h'});

  // Set cookie (httpOnly, secure in production)
  const cookieStore = await cookies();
  cookieStore.set('insektstop', token, {
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
    return {error: 'Ungültige E-Mail-Adresse'};
  }

  // Check if user exists
  const user = await prisma.user.findUnique({where: {email: comingEmail}});
  if (!user) {
    return {error: 'Benutzer nicht gefunden'};
  }

  if (user.email !== comingEmail) {
    return {error: 'E-Mail stimmt nicht mit unseren Aufzeichnungen überein'};
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
    return {error: 'Fehler beim Setzen des Rücksetz-Tokens'};
  }

  // Send the password reset email
  const emailResult = await sendResendEmail({
    email: comingEmail,
    activationCode: token,
  });
  if (!emailResult) {
    return {error: 'Fehler beim Senden der Passwort-Zurücksetzungs-E-Mail'};
  }
  return {success: true, message: 'Passwort-Zurücksetzungs-E-Mail gesendet'};
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string;
  const verificationCode = formData.get('verificationCode') as string;
  const newPassword = formData.get('newPassword') as string;

  // Validate email format (basic check)
  const result = z.string().email().safeParse(email);
  if (!result.success) {
    return {error: 'Ungültige E-Mail-Adresse'};
  }

  // Check if user exists
  const user = await prisma.user.findUnique({where: {email}});
  if (!user) {
    return {error: 'Benutzer nicht gefunden'};
  }

  // Check if the provided verification code matches the one in the database
  if (user.resetToken !== verificationCode) {
    return {error: 'Ungültiger Verifizierungscode'};
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password and clear the reset token
  const updatedUser = await prisma.user.update({
    where: {email},
    data: {password: hashedPassword, resetToken: null},
  });

  if (!updatedUser) {
    return {error: 'Fehler beim Zurücksetzen des Passworts'};
  }
  return {success: true, message: 'Passwort wurde erfolgreich zurückgesetzt'};
}
