'use client';

import {useUserStore} from '../components/LayoutClientWrapper';
import Svg from '../components/Svg';
import {ABOUTSCENESVG} from '../utils/svg';

export function AboutContent() {
  const user = useUserStore((state) => state.user);
  return (
    <div className='min-h-screen flex flex-col bg-secondary'>
      <div className='pt-20 px-4 sm:px-8 lg:px-16'>
        <div>
          <h1 className='text-2xl text-center font-bold text-dark-text'>
            InsektStop
          </h1>
          <div className='text-center'>{user?.about}</div>
        </div>
      </div>
      <div>
        <Svg
          icon={ABOUTSCENESVG}
          size={400}
          className='w-full contact-scene-buzz [&_path[data-testid^="fly-"]]:animate-buzz'
        />
      </div>
    </div>
  );
}
