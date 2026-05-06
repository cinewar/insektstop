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
  metadataBase: new URL('https://inseka.de'),
  title: {
    default: 'Insektstop - Insektenschutz Produkte',
    template: '%s | Insektstop',
  },
  description:
    'Insektstop bietet hochwertige Insektenschutz Produkte fuer Fenster, Tueren und Wohnbereiche.',
  keywords: [
    'Insektenschutz',
    'Insektenschutz Produkte',
    'Fliegengitter',
    'Mueckenschutz',
    'Insektenschutz fuer Fenster',
    'Insektenschutz fuer Tueren',
  ],
  openGraph: {
    title: 'Insektstop - Insektenschutz Produkte',
    description:
      'Entdecken Sie passgenaue Insektenschutz Produkte fuer Fenster und Tueren bei Insektstop.',
    type: 'website',
    locale: 'de_DE',
    siteName: 'Insektstop',
  },
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
    <html lang='de'>
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
            <LayoutClientWrapper user={user} sessionUser={sessionUser}>
              {children}
            </LayoutClientWrapper>
          </div>
        </NuqsAdapter>
      </body>
    </html>
  );
}
