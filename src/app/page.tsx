import {prisma} from '@/lib/prisma';
import {Cards} from './components/Cards';
import {Contributers} from './components/Contributers';
import {Fly} from './components/Fly';
import {Hero} from './components/Hero';
import {VideoPlayer} from './components/Video';

export default async function Home() {
  const products = await prisma.product.findMany();
  return (
    <div className='min-h-screen flex flex-col bg-secondary'>
      <Hero />
      <Cards products={products} />
      <Contributers />
      <VideoPlayer />
      <Fly />
    </div>
  );
}
