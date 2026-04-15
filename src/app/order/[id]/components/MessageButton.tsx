'use client';

import {EMAILSVG} from '@/app/utils/svg';
import {GlassyButton} from '@/app/components/GlassyButton';

type MessageButtonProps = {
  count?: number;
  onClickAction?: () => void;
};

export function MessageButton({count = 0, onClickAction}: MessageButtonProps) {
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
    <div className='fixed left-4 bottom-4 z-40'>
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
