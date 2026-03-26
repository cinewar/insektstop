'use client';

import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {Product} from '../../../generated/prisma/client';

type FilteredProductsDropdownProps = {
  products: Product[];
};

export function FilteredProductsDropdown({
  products,
}: FilteredProductsDropdownProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [showTopGlow, setShowTopGlow] = useState(false);
  const [showBottomGlow, setShowBottomGlow] = useState(false);

  const updateGlowVisibility = () => {
    const el = listRef.current;

    if (!el) return;

    const hasOverflow = el.scrollHeight > el.clientHeight;
    const isAtTop = el.scrollTop <= 1;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

    setShowTopGlow(hasOverflow && !isAtTop);
    setShowBottomGlow(hasOverflow && !isAtBottom);
  };

  useEffect(() => {
    const frameId = requestAnimationFrame(updateGlowVisibility);

    return () => cancelAnimationFrame(frameId);
  }, [products]);

  return (
    <div className='absolute text-dark-text rounded-md bg-secondary shadow-lg top-11 left-0 w-full overflow-hidden'>
      <div
        ref={listRef}
        onScroll={updateGlowVisibility}
        className='max-h-80 overflow-auto flex flex-col gap-2 px-2 pt-2 pb-6'
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className='shadow-custom rounded-md p-4 bg-secondary '
          >
            {product.name}
          </Link>
        ))}
      </div>
      {showTopGlow && (
        <div className='pointer-events-none absolute top-0 left-0 w-full h-4 bg-linear-to-b from-dark-text/50 to-secondary/50' />
      )}
      {showBottomGlow && (
        <div className='pointer-events-none absolute bottom-0 left-0 w-full h-4 bg-linear-to-t from-dark-text/50 to-secondary/50' />
      )}
    </div>
  );
}
