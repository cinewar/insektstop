'use client';

import {useRef, useState} from 'react';
import Image from 'next/image';
import {ADDPHOTOSVG, EDITSVG} from '../utils/svg';
import Svg from './Svg';

interface ImageUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function ImageUpload({
  label,
  className,
  onChange,
  ...props
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const showProgressBorder = progress > 0 || Boolean(preview);

  return (
    <div className='relative w-full aspect-square rounded-md overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer'>
      <div className='relative z-10 flex h-12 w-12 items-center justify-center rounded-full'>
        <svg
          viewBox='0 0 48 48'
          className='pointer-events-none absolute inset-0 h-full w-full -rotate-90'
          aria-hidden='true'
        >
          <circle
            cx='24'
            cy='24'
            r='21'
            fill='none'
            stroke='rgba(255, 71, 249, 0.3)'
            strokeWidth='3'
          />
          <circle
            cx='24'
            cy='24'
            r='21'
            fill='none'
            stroke='var(--color-primary)'
            strokeWidth='3'
            strokeLinecap='round'
            pathLength='100'
            strokeDasharray={`${progress} 100`}
            className='transition-[stroke-dasharray,opacity] duration-150'
            opacity={showProgressBorder ? 1 : 0}
          />
        </svg>

        <button
          type='button'
          className='relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray/50'
          onClick={() => inputRef.current?.click()}
          aria-label={preview ? 'Edit image' : 'Add image'}
        >
          <Svg
            icon={preview ? EDITSVG : ADDPHOTOSVG}
            size={30}
            className='text-primary'
          />
        </button>
      </div>

      {preview && (
        <Image
          src={preview}
          alt='Preview'
          className='absolute inset-0 w-full h-full object-cover'
          fill
        />
      )}
      {label && (
        <label htmlFor={props.id || props.name} className='block -mb-2'>
          {label}
        </label>
      )}
      <input
        {...props}
        ref={inputRef}
        type='file'
        accept={props.accept || 'image/*'}
        className={`absolute inset-0 opacity-0 cursor-pointer ${className || ''}`.trim()}
        onChange={(e) => {
          onChange?.(e);

          setPreview(null);
          setProgress(0);

          const file = e.target.files?.[0];

          if (!file) {
            return;
          }

          const reader = new FileReader();

          reader.onloadstart = () => {
            setProgress(10);
          };

          reader.onprogress = (event) => {
            if (!event.lengthComputable || event.total === 0) {
              return;
            }

            setProgress(Math.round((event.loaded / event.total) * 100));
          };

          reader.onloadend = () => {
            setPreview(
              typeof reader.result === 'string' ? reader.result : null,
            );
            setProgress(100);
          };

          reader.readAsDataURL(file);
        }}
      />
    </div>
  );
}
