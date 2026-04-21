import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import {NuqsAdapter} from 'nuqs/adapters/next/app';
import './globals.css';
import {Header} from './components/Header';
import ShowHeader from './components/ShowHeader';
import LayoutClientWrapper from './components/LayoutClientWrapper';
import {ContactButtons} from './components/ContactButtons';
import {Notification} from './components/Notification';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='tr'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen max-w-120 relative mx-auto`}
      >
        <NuqsAdapter>
          <Notification />
          <ContactButtons />
          <ShowHeader>
            <Header />
          </ShowHeader>
          <LayoutClientWrapper>{children}</LayoutClientWrapper>
        </NuqsAdapter>
      </body>
    </html>
  );
}
