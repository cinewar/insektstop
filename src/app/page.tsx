import {Cards} from './components/Cards';
import {Contributers} from './components/Contributers';
import {Hero} from './components/Hero';
import {VideoPlayer} from './components/Video';

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col bg-secondary'>
      <Hero />
      <Cards />
      <Contributers />
      <VideoPlayer />
    </div>
  );
}
