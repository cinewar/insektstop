'use client';

/**
 * Describes behavior for VideoPlayer.
 * Usage: Call VideoPlayer(...) where this declaration is needed in the current module flow.
 */
export function VideoPlayer() {
  return (
    <div className='w-full relative overflow-hidden'>
      <iframe
        src='https://www.youtube.com/embed/PhmbWApGN2E'
        width='100%'
        className='h-75 sm:h-120'
        allowFullScreen
      />
    </div>
  );
}
