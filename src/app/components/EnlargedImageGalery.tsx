'use client';

import {useRef, useState} from 'react';
import Image from 'next/image';
import {CLOSESVG, LEFTSVG, RIGHTSVG} from '../utils/svg';
import Svg from './Svg';
import {normalizeImageUrl} from '@/lib/image-url';

const SWIPE_THRESHOLD = 40;

/**
 * Describes behavior for EnlargedImageGalery.
 * Usage: Call EnlargedImageGalery(...) where this declaration is needed in the current module flow.
 */
export function EnlargedImageGalery({
  images,
  onCloseAction,
  currentIndex: initialIndex = 0,
}: {
  images: string[];
  onCloseAction: () => void;
  currentIndex?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef(0);
  const hasImages = images.length > 0;
  const isFirstImage = currentIndex <= 0;
  const isLastImage = currentIndex >= images.length - 1;

  const handleNext = () => {
    if (!hasImages || isLastImage) {
      return;
    }

    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handlePrev = () => {
    if (!hasImages || isFirstImage) {
      return;
    }

    setCurrentIndex((prevIndex) => prevIndex - 1);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) {
      return;
    }

    touchDeltaXRef.current =
      (event.touches[0]?.clientX ?? touchStartXRef.current) -
      touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null) {
      return;
    }

    if (touchDeltaXRef.current <= -SWIPE_THRESHOLD) {
      handleNext();
    } else if (touchDeltaXRef.current >= SWIPE_THRESHOLD) {
      handlePrev();
    }

    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center px-1 bg-black/15 backdrop-blur-sm bg-opacity-75'
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Svg
        icon={CLOSESVG}
        size={32}
        className='absolute top-4 right-4 z-20 text-primary cursor-pointer'
        onClick={onCloseAction}
      />
      <button
        type='button'
        onClick={handlePrev}
        disabled={!hasImages || isFirstImage}
        className='absolute left-4 z-20 text-white text-2xl font-bold disabled:opacity-30 disabled:cursor-not-allowed'
      >
        <Svg icon={LEFTSVG} className='[svg]:stroke-2' size={48} />
      </button>
      {hasImages && (
        <Image
          src={normalizeImageUrl(images[currentIndex])}
          alt={`Image ${currentIndex + 1}`}
          className='max-w-full rounded-[inherit] max-h-full object-contain'
          fill
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw'
        />
      )}
      <button
        type='button'
        onClick={handleNext}
        disabled={!hasImages || isLastImage}
        className='absolute right-4 z-20 text-white text-2xl font-bold disabled:opacity-30 disabled:cursor-not-allowed'
      >
        <Svg icon={RIGHTSVG} className='[svg]:stroke-2' size={48} />
      </button>
    </div>
  );
}
