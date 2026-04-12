'use client';

import {useEffect, useRef, useState} from 'react';
import Image from 'next/image';
import {EDITSVG, TRASHSVG} from '../utils/svg';
import ActionMenu from './ActionMenu';

const MAX_UPLOAD_DIMENSION = 2000;
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const JPEG_QUALITY = 0.82;

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new window.Image();
      element.onload = () => resolve(element);
      element.onerror = () =>
        reject(new Error('Failed to load selected image'));
      element.src = imageUrl;
    });

    return image;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.size <= MAX_UPLOAD_BYTES) {
    return file;
  }

  const image = await loadImageFromFile(file);
  const largestSide = Math.max(image.width, image.height);
  const scale =
    largestSide > MAX_UPLOAD_DIMENSION ? MAX_UPLOAD_DIMENSION / largestSide : 1;
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (!context) {
    return file;
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY);
  });

  if (!blob || blob.size >= file.size) {
    return file;
  }

  const nextName = file.name.replace(/\.[^.]+$/, '') || 'upload';

  return new File([blob], `${nextName}.jpg`, {
    type: 'image/jpeg',
    lastModified: file.lastModified,
  });
}

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
  const previewUrlRef = useRef<string | null>(null);
  const preview =
    selectedPreview ?? (isDeleted ? null : (defaultValue ?? null));
  const effectiveProgress = selectedPreview ? progress : preview ? 100 : 0;
  const showProgressBorder = progress > 0 || Boolean(preview);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  return (
    <div className='relative w-full aspect-square rounded-md bg-gray-200 flex items-center justify-center cursor-pointer'>
      <div
        className={`relative flex h-12 w-12 items-center bg-gray/60 justify-center rounded-full ${
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
              label: preview ? 'Düzenle' : 'Ekle',
              onClick: () => inputRef.current?.click(),
            },
            {
              id: 'delete',
              icon: TRASHSVG,
              label: 'Sil',
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
      </div>

      {preview && (
        <Image
          src={preview}
          alt='Önizleme'
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
        onChange={async (e) => {
          setIsDeleted(false);
          setSelectedPreview(null);
          setProgress(0);

          const originalFile = e.target.files?.[0];

          if (!originalFile) {
            return;
          }

          onFileSelectedAction?.();

          setProgress(10);

          let uploadFile = originalFile;

          try {
            uploadFile = await compressImageFile(originalFile);
          } catch {
            uploadFile = originalFile;
          }

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(uploadFile);
          e.target.files = dataTransfer.files;

          if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
          }

          const nextPreviewUrl = URL.createObjectURL(uploadFile);
          previewUrlRef.current = nextPreviewUrl;
          setSelectedPreview(nextPreviewUrl);
          setProgress(100);
          onChange?.(e);
        }}
      />
    </div>
  );
}
