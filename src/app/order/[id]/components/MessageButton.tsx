'use client';

import {EMAILSVG} from '@/app/utils/svg';
import {GlassyButton} from '@/app/components/GlassyButton';
import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';

type MessageButtonProps = {
  count?: number;
  onClickAction?: () => void;
};

export function MessageButton({count = 0, onClickAction}: MessageButtonProps) {
  const path = usePathname();
  const pathParts = path.split('/').filter(Boolean);
  const isOrderDetailPage =
    pathParts.length === 2 && pathParts[0] === 'order' && pathParts[1] !== null;

  const [aboveFooter, setAboveFooter] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 40; // 120px from bottom
      setAboveFooter(scrollPosition >= threshold);
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // check on mount
    return () => window.removeEventListener('scroll', handleScroll);
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

  return (
    <div
      className={`fixed left-4 bottom-4 z-40 transition-transform duration-300 
                ${aboveFooter && isOrderDetailPage ? '-translate-y-16' : ''}`}
    >
      <div className='relative'>
        <GlassyButton
          icon={EMAILSVG}
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
