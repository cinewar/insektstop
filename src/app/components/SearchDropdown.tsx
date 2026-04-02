'use client';

import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {parseAsString, useQueryState} from 'nuqs';
import {Product} from '../../../generated/prisma/client';
import {EDITSVG, RIGHTARROWSVG, TRASHSVG} from '../utils/svg';
import {GlassyButton} from './GlassyButton';
import {useRouter} from 'next/navigation';

type SearchDropdownProps = {
  products?: Product[];
  orderId?: string;
  onEdit?: () => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
};

export function SearchDropdown({
  products,
  orderId,
  onEdit,
  onDelete,
}: SearchDropdownProps) {
  const router = useRouter();
  const [, setQuery] = useQueryState(
    'q',
    parseAsString.withOptions({shallow: false}),
  );
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

  const handleDelete = async () => {
    await onDelete?.();
    setQuery(null);
  };

  return (
    <div className='absolute text-dark-text rounded-md bg-gray shadow-lg top-11 left-0 w-full overflow-hidden'>
      <div
        ref={listRef}
        onScroll={updateGlowVisibility}
        className='max-h-80 overflow-auto flex flex-col gap-2 p-2 '
      >
        {products &&
          products.length > 0 &&
          products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className='shadow-custom rounded-md p-4 bg-secondary '
            >
              {product.name}
            </Link>
          ))}
        {orderId && (
          <div className='flex flex-col gap-2'>
            <GlassyButton
              icon={RIGHTARROWSVG}
              label='View Order'
              iconSize={32}
              className='pr-4'
              onClick={() => router.push(`/order/${orderId}`)}
            />
            <div className='flex gap-2 justify-between'>
              <GlassyButton
                icon={EDITSVG}
                label='Edit Order'
                iconSize={40}
                onClick={onEdit}
              />
              <GlassyButton
                icon={TRASHSVG}
                label='Delete Order'
                iconSize={40}
                onClick={handleDelete}
              />
            </div>
          </div>
        )}
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
