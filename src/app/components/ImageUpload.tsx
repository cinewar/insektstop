'use client';

import {useRef, useState} from 'react';
import Image from 'next/image';
import {EDITSVG, TRASHSVG} from '../utils/svg';
import ActionMenu from './ActionMenu';

/**
  * Defines the ImageUploadProps interface.
  * Usage: Implement or consume ImageUploadProps when exchanging this structured contract.
  */
interface ImageUploadProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'defaultValue'
> {
  label?: string;
  defaultValue?: string;
  onDeleteAction?: () => void;
  onFileSelectedAction?: () => void;
}

/**
  * Describes behavior for ImageUpload.
  * Usage: Call ImageUpload(...) where this declaration is needed in the current module flow.
  */
export function ImageUpload({
  label,
  className,
  onChange,
  defaultValue,
  onDeleteAction,
  onFileSelectedAction,
  ...props
}: ImageUploadProps) {
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const preview =
    selectedPreview ?? (isDeleted ? null : (defaultValue ?? null));
  const effectiveProgress = selectedPreview ? progress : preview ? 100 : 0;
  const showProgressBorder = progress > 0 || Boolean(preview);

  return (
    <div className='relative w-full aspect-square rounded-md bg-gray-200 flex items-center justify-center cursor-pointer'>
      <div
        className={`relative flex h-12 w-12 items-center justify-center rounded-full ${
          isMenuOpen ? 'z-200' : 'z-10'
        }`}
      >
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
            strokeDasharray={`${effectiveProgress} 100`}
            className='transition-[stroke-dasharray,opacity] duration-150'
            opacity={showProgressBorder ? 1 : 0}
          />
        </svg>
        <ActionMenu
          className='absolute inset-0 z-50'
          onOpenChangeAction={setIsMenuOpen}
          actions={[
            {
              id: 'edit',
              icon: EDITSVG,
              label: preview ? 'Edit' : 'Add',
              onClick: () => inputRef.current?.click(),
            },
            {
              id: 'delete',
              icon: TRASHSVG,
              label: 'Delete',
              onClick: () => {
                if (inputRef.current) {
                  inputRef.current.value = '';
                }

                setSelectedPreview(null);
                setProgress(0);
                setIsDeleted(true);
                onDeleteAction?.();
              },
            },
          ]}
        />

        {/* <button
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
        </button> */}
      </div>

      {preview && (
        <Image
          src={preview}
          alt='Preview'
          className='absolute inset-0 w-full h-full object-cover rounded-[inherit]'
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

          setIsDeleted(false);
          setSelectedPreview(null);
          setProgress(0);

          const file = e.target.files?.[0];

          if (!file) {
            return;
          }

          onFileSelectedAction?.();

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
            setSelectedPreview(
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
