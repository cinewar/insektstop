import {prisma} from '@/lib/prisma';
import {Cards} from './components/Cards';
import {Contributers} from './components/Contributers';
import {Fly} from './components/Fly';
import {Hero} from './components/Hero';
import {VideoPlayer} from './components/Video';
import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Insektenschutz Produkte fuer Fenster und Tueren',
  description:
    'Finden Sie Insektenschutz Produkte fuer Fenster, Tueren und Terrassen. Insektstop bietet langlebige und passgenaue Loesungen.',
  keywords: [
    'Insektenschutz Produkte',
    'Fliegengitter kaufen',
    'Fenster Insektenschutz',
    'Tueren Insektenschutz',
  ],
  openGraph: {
    title: 'Insektenschutz Produkte fuer Fenster und Tueren',
    description:
      'Passende Insektenschutz Produkte fuer Ihr Zuhause - von Fliegengittern bis Sonderloesungen.',
    type: 'website',
  },
};

export default async function Home() {
  const products = await prisma.product.findMany({
    where: {active: true},
  });
  return (
    <div className='flex flex-col bg-secondary'>
      <Hero />
      <Cards products={products} />
      <Contributers />
      <VideoPlayer />
      <Fly />
    </div>
  );
}
