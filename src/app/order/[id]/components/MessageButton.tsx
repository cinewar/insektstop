'use client';

import {GlassyButton} from '@/app/components/GlassyButton';
import {MESSAGESVG} from '@/app/utils/svg';
import {useEffect, useState, useRef} from 'react';

type MessageButtonProps = {
  count?: number;
  onClickAction?: () => void;
};

export function MessageButton({count = 0, onClickAction}: MessageButtonProps) {
  const [screenWidth, setScreenWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [aboveFooter, setAboveFooter] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.offsetHeight - 120;
      setAboveFooter(scrollPosition >= threshold);
    }
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll(); // check on mount
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Log screen size and container size
  useEffect(() => {
    function logSizes() {
      const screenWidth = window.innerWidth;
      let containerWidth = null;
      if (buttonRef.current) {
        let el = buttonRef.current.parentElement;
        while (el) {
          if (el.classList.contains('max-w-208.5')) {
            containerWidth = el.clientWidth;
            break;
          }
          el = el.parentElement;
        }
      }
      setScreenWidth(screenWidth);
      setContainerWidth(containerWidth ?? 0);
    }
    logSizes();
    window.addEventListener('resize', logSizes);
    return () => {
      window.removeEventListener('resize', logSizes);
    };
  }, []);

  function handleClick() {
    if (onClickAction) {
      onClickAction();
      return;
    }

    const target = document.getElementById('messages');
    if (target) {
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
      return;
    }

    window.location.hash = 'messages';
  }

  const buttonPosition = (screenWidth - containerWidth) / 2 + 16; // 16px is the left offset
  console.log(
    'Screen width:',
    screenWidth,
    'Container width:',
    containerWidth,
    'Button position:',
    buttonPosition,
  );

  return (
    <div
      ref={buttonRef}
      className={`fixed bottom-4 z-40 transition-transform duration-300 ${aboveFooter ? '-translate-y-16 sm:-translate-y-20' : ''}`}
      style={{left: `${buttonPosition}px`}}
    >
      <div className='relative'>
        <GlassyButton
          icon={MESSAGESVG}
          iconSize={45}
          aria-label='Mesajlara git'
          onClick={handleClick}
        />
        {count > 0 && (
          <span className='absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center'>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>
    </div>
  );
}
