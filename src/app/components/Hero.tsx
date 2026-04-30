'use client';
import Link from 'next/link';

/**
 * Describes behavior for Hero.
 * Usage: Call Hero(...) where this declaration is needed in the current module flow.
 */
export function Hero() {
  return (
    <section
      className='relative w-full h-95 sm:h-137.5 gap-6 bg-[url("/hero.png")] bg-cover bg-center
                after:absolute after:inset-0 after:bg-black/25 after:z-0 
                flex justify-center items-end p-4 sm:p-8
    '
    >
      <div
        className='absolute top-20 right-0 sm:top-34 sm:left-4.5 p-6 w-75 h-40 sm:w-107.5 sm:h-62.5 flex justify-center items-center z-1
                    glassy shadow-lg rounded-[30px] text-white text-sm font-medium overflow-hidden
      '
      >
        <div className='border-mask'>
          <div data-testid='border-glow' className='border-glow'></div>
        </div>
        <h1 className='text-2xl sm:text-[48px] font-medium text-white text-center'>
          Evinizde Rahatça Oturmanın Yegane Yolu
        </h1>
      </div>
      <Link
        href='/order'
        className='relative active:scale-95 transition-transform inline-flex 
                items-center justify-center cursor-pointer px-4 sm:px-12 py-2 min-w-30 bg-primary
              text-white text-lg font-medium rounded-[100vw] shadow-md hover:bg-tertiary z-2 shining'
      >
        Fiyat Al
      </Link>
      {/* <Image
        src='/hero.png'
        alt='Hero Image'
        width={600}
        height={400}
        className='mx-auto'
      /> */}
    </section>
  );
}
