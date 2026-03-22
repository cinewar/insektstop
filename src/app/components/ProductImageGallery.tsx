'use client';

import Image from 'next/image';
import {useEffect, useRef, useState} from 'react';

type ProductImage = {
  id: number;
  img: string;
  alt?: string;
};

export function ProductImageGallery({images}: {images: ProductImage[]}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLeftGlow, setShowLeftGlow] = useState(false);
  const [showRightGlow, setShowRightGlow] = useState(false);
  const thumbnailsScrollRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLImageElement | null)[]>([]);

  const activeImage = images[selectedImageIndex] ?? images[0];

  const updateGlowVisibility = () => {
    const el = thumbnailsScrollRef.current;
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
  }, [images.length]);

  useEffect(() => {
    if (!images.length) {
      return;
    }

    const selectedThumbnail = thumbnailRefs.current[selectedImageIndex];
    selectedThumbnail?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });

    const frameId = requestAnimationFrame(updateGlowVisibility);
    return () => cancelAnimationFrame(frameId);
  }, [images.length, selectedImageIndex]);

  if (!images.length) {
    return null;
  }

  return (
    <div className='relative'>
      <div
        ref={thumbnailsScrollRef}
        onScroll={updateGlowVisibility}
        className='absolute top-0 overflow-auto no-scrollbar flex gap-1 opacity-70 z-10 w-full'
      >
        {images.map((image, index) => (
          <Image
            key={`${image.img}-${image.id}`}
            ref={(element) => {
              thumbnailRefs.current[index] = element;
            }}
            onClick={() => setSelectedImageIndex(index)}
            className={`border object-cover w-20 h-20 shadow-lg rounded-lg ${
              selectedImageIndex === index
                ? 'border-primary'
                : 'border-dark-text hover:border-primary'
            }`}
            src={image.img}
            alt={image.alt || 'Product Image'}
            width={200}
            height={200}
          />
        ))}
      </div>
      {showLeftGlow && (
        <div className='pointer-events-none absolute top-0 left-0 z-20 h-20 w-8 bg-linear-to-r from-dark-text/50 to-transparent' />
      )}
      {showRightGlow && (
        <div className='pointer-events-none absolute top-0 right-0 z-20 h-20 w-8 bg-linear-to-l from-dark-text/50 to-transparent' />
      )}
      <Image
        src={activeImage.img}
        alt={activeImage.alt || 'Product Image'}
        width={500}
        height={400}
        className='object-cover object-center w-full h-80'
      />
    </div>
  );
}
