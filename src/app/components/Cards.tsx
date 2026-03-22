'use client';

import Image from 'next/image';
import products from '@/lib/products.json';
import {Card} from './Card';
import Svg from './Svg';
import {RIGHTARROWSVG} from '../utils/svg';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';

export function Cards() {
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

  return (
    <div className='relative w-full overflow-hidden'>
      <div
        ref={scrollRef}
        onScroll={updateGlowVisibility}
        className='flex gap-3 w-full py-4 px-2 overflow-auto no-scrollbar'
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className='relative'
          >
            <Card key={product.id} className='relative bg-tertiary'>
              <h2 className='absolute text-white font-bold shadow-lg top-2 right-2 bg-tertiary p-1 rounded-full'>
                ${product.price.toFixed(2)}
              </h2>
              <Image
                src={product.images[0].img}
                alt={product.images[0].alt || product.name}
                width={200}
                height={200}
                className='rounded-lg h-32 w-full object-cover'
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
