import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import {NuqsAdapter} from 'nuqs/adapters/next/app';
import './globals.css';
import {Header} from './components/Header';
import ShowHeader from './components/ShowHeader';
import LayoutClientWrapper from './components/LayoutClientWrapper';
import {ContactButtons} from './components/ContactButtons';
import {Notification} from './components/Notification';
import {getSessionUser} from './lib/session';
import {JwtPayload} from 'jsonwebtoken';
import {prisma} from '@/lib/prisma';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Insektstop',
  description: 'Insektstop resmi web uygulamasi',
};

export type SessionUser = string | JwtPayload | null;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await prisma.user.findFirst({});
  const sessionUser: SessionUser = await getSessionUser();

  return (
    <html lang='tr'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-200`}
      >
        <NuqsAdapter>
          <div className='max-w-208.5 relative mx-auto'>
            <Notification />
            <ContactButtons user={user} />
            <ShowHeader>
              <Header />
            </ShowHeader>
            <LayoutClientWrapper sessionUser={sessionUser}>
              {children}
            </LayoutClientWrapper>
          </div>
        </NuqsAdapter>
      </body>
    </html>
  );
}
