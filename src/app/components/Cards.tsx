'use client';

import Image from 'next/image';
import {Card} from './Card';
import Svg from './Svg';
import {RIGHTARROWSVG} from '../utils/svg';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {Product} from '../../../generated/prisma/client';
import {normalizeImageUrl} from '@/lib/image-url';

/**
 * Defines the CardsProps interface.
 * Usage: Implement or consume CardsProps when exchanging this structured contract.
 */
interface CardsProps {
  products: Product[];
}

/**
 * Describes behavior for Cards.
 * Usage: Call Cards(...) where this declaration is needed in the current module flow.
 */
export function Cards({products}: CardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftGlow, setShowLeftGlow] = useState(false);
  const [showRightGlow, setShowRightGlow] = useState(false);

  const updateGlowVisibility = () => {
    const el = scrollRef.current;
    if (!el) return;

    const hasOverflow = el.scrollWidth > el.clientWidth;
    const isAtLeft = el.scrollLeft <= 1;
    const isAtRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

    setShowLeftGlow(hasOverflow && !isAtLeft);
    setShowRightGlow(hasOverflow && !isAtRight);
  };

  useEffect(() => {
    const frameId = requestAnimationFrame(updateGlowVisibility);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      // Only intercept wheel events on non-mobile (sm+) screens.
      if (!window.matchMedia('(min-width: 640px)').matches) return;

      const hasHorizontalOverflow = el.scrollWidth > el.clientWidth;
      const horizontalDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;

      if (hasHorizontalOverflow && horizontalDelta !== 0) {
        el.scrollLeft += horizontalDelta;
      }

      event.preventDefault();
      event.stopPropagation();
    };

    el.addEventListener('wheel', onWheel, {passive: false});

    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <div className='relative w-full overflow-hidden'>
      <div
        ref={scrollRef}
        onScroll={updateGlowVisibility}
        className='flex gap-3 w-full py-4 px-2 overflow-x-auto touch-auto sm:overscroll-x-contain sm:overscroll-y-none sm:touch-pan-x no-scrollbar'
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className='relative '
          >
            <Card
              key={product.id}
              className='relative w-45 sm:w-55 bg-tertiary'
            >
              <h2 className='absolute text-white font-bold shadow-lg top-2 right-2 bg-tertiary p-1 rounded-full'>
                £{product.price.toFixed(2)}
              </h2>
              <Image
                src={normalizeImageUrl(
                  product.images[0]?.img || '/placeholder.png',
                )}
                alt={product.name}
                width={220}
                height={128}
                className='rounded-lg h-32 object-cover'
              />
              <div className='p-2 h-30 justify-between flex flex-col'>
                <div className='font-bold mb-1'>
                  <h2>{product.name}</h2>
                  {/* <h2>${product.price.toFixed(2)}</h2> */}
                </div>
                <div className='flex items-end'>
                  <p className='line-clamp-2'>{product.description}</p>
                  <p>
                    <Svg icon={RIGHTARROWSVG} size={24} />
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      {showLeftGlow && (
        <div className='pointer-events-none absolute top-0 left-0 h-full w-8 bg-linear-to-r from-dark-text/50 to-transparent' />
      )}
      {showRightGlow && (
        <div className='pointer-events-none absolute top-0 right-0 h-full w-8 bg-linear-to-l from-dark-text/50 to-transparent' />
      )}
    </div>
  );
}
