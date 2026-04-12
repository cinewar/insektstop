'use client';

import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {parseAsString, useQueryState} from 'nuqs';
import {Product} from '../../../generated/prisma/client';
import {EDITSVG, RIGHTARROWSVG, TRASHSVG} from '../utils/svg';
import {GlassyButton} from './GlassyButton';
import {useRouter} from 'next/navigation';
import {Confirmation} from './Confirmation';
import {notify} from '../lib/notifications';

/**
 * Defines the SearchDropdownProps type.
 * Usage: Use SearchDropdownProps to type related values and keep data contracts consistent.
 */
type SearchDropdownProps = {
  products?: Product[];
  orderId?: string;
  onEditAction?: () => void | Promise<void>;
  onDeleteAction?: () => void | Promise<void>;
};

/**
 * Describes behavior for SearchDropdown.
 * Usage: Call SearchDropdown(...) where this declaration is needed in the current module flow.
 */
export function SearchDropdown({
  products,
  orderId,
  onEditAction,
  onDeleteAction,
}: SearchDropdownProps) {
  const router = useRouter();
  const [, setQuery] = useQueryState(
    'q',
    parseAsString.withOptions({shallow: false}),
  );
  const listRef = useRef<HTMLDivElement>(null);
  const isDeletingRef = useRef(false);
  const [showTopGlow, setShowTopGlow] = useState(false);
  const [showBottomGlow, setShowBottomGlow] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleConfirmDelete = async () => {
    if (isDeletingRef.current) return;

    isDeletingRef.current = true;
    setIsDeleting(true);

    try {
      await onDeleteAction?.();
      setQuery(null);
      setShowDeleteConfirmation(false);
      notify({
        type: 'success',
        title: 'Sipariş silindi',
        message: 'Seçilen sipariş başarıyla silindi.',
      });
    } catch {
      notify({
        type: 'error',
        title: 'Sipariş silme basarisiz',
        message: 'Lütfen tekrar deneyin.',
      });
    } finally {
      isDeletingRef.current = false;
      setIsDeleting(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
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
              label='Siparişi Gör'
              iconSize={32}
              className='pr-4'
              onClick={() => router.push(`/order/${orderId}`)}
            />
            <div className='flex gap-2 justify-between'>
              <GlassyButton
                icon={EDITSVG}
                label='Siparişi Düzenle'
                iconSize={40}
                onClick={onEditAction}
              />
              <GlassyButton
                icon={TRASHSVG}
                label='Siparişi Sil'
                iconSize={40}
                onClick={handleDelete}
              />
            </div>
          </div>
        )}
      </div>
      {showDeleteConfirmation && (
        <Confirmation
          message='Bu siparişi silmek istediginize emin misiniz?'
          onConfirmAction={handleConfirmDelete}
          onCancelAction={() => setShowDeleteConfirmation(false)}
          isLoading={isDeleting}
        />
      )}
      {showTopGlow && (
        <div className='pointer-events-none absolute top-0 left-0 w-full h-4 bg-linear-to-b from-dark-text/50 to-secondary/50' />
      )}
      {showBottomGlow && (
        <div className='pointer-events-none absolute bottom-0 left-0 w-full h-4 bg-linear-to-t from-dark-text/50 to-secondary/50' />
      )}
    </div>
  );
}
