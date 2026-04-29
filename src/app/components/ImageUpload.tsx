'use client';

import {useEffect, useRef, useState} from 'react';
import Image from 'next/image';
import {ADDPHOTOSVG, EDITSVG, TRASHSVG} from '../utils/svg';
import ActionMenu from './ActionMenu';
import Svg from './Svg';

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
  uploadType?: 'single' | 'multiple';
  label?: string;
  defaultValue?: string | string[];
  onDeleteAction?: () => void;
  onFileSelectedAction?: () => void;
  onFilesChange?: (files: File[]) => void;
  onImagesChange?: (payload: {files: File[]; urls: string[]}) => void;
}

/**
 * Describes behavior for ImageUpload.
 * Usage: Call ImageUpload(...) where this declaration is needed in the current module flow.
 */
export function ImageUpload({
  uploadType = 'single',
  label,
  className,
  onChange,
  defaultValue,
  onDeleteAction,
  onFileSelectedAction,
  ...props
}: ImageUploadProps) {
  // State for single upload
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const preview =
    selectedPreview ??
    (isDeleted
      ? null
      : Array.isArray(defaultValue)
        ? defaultValue[0]
        : (defaultValue ?? null));
  const effectiveProgress = selectedPreview ? progress : preview ? 100 : 0;
  const showProgressBorder = progress > 0 || Boolean(preview);

  // State for multiple upload
  const [selectedPreviews, setSelectedPreviews] = useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : [],
  );
  const [files, setFiles] = useState<File[]>([]);
  const [multiProgress, setMultiProgress] = useState<number[]>([]);
  const multiInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);

  // Update previews if defaultValue changes (for multiple mode)
  useEffect(() => {
    if (Array.isArray(defaultValue)) {
      setSelectedPreviews(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      // Clean up multiple previews
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  async function handleSingleChange(e: React.ChangeEvent<HTMLInputElement>) {
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
  }

  async function handleMultiChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;
    // Prevent upload if total would exceed 15
    let currentFiles = [...files];
    if (currentFiles.length + fileList.length > 15) {
      if (multiInputRef.current) multiInputRef.current.value = '';
      return;
    }
    onFileSelectedAction?.();
    let currentProgress = [...multiProgress];
    const availableSlots = 15 - currentFiles.length;
    const limitedFiles = fileList.slice(0, availableSlots);
    // Compress all new files
    const compressedFiles: File[] = [];
    for (let i = 0; i < limitedFiles.length; i++) {
      let file = limitedFiles[i];
      try {
        file = await compressImageFile(file);
      } catch {}
      compressedFiles.push(file);
    }
    // Append new files
    currentFiles = currentFiles.concat(compressedFiles);
    currentProgress = currentProgress.concat(
      Array(compressedFiles.length).fill(100),
    );
    setFiles(currentFiles);
    setMultiProgress(currentProgress);
    // Update input files for parent
    const dataTransfer = new DataTransfer();
    currentFiles.forEach((f) => dataTransfer.items.add(f));
    if (multiInputRef.current) multiInputRef.current.files = dataTransfer.files;
    e.target.files = dataTransfer.files;
    onChange?.(e);
    // Notify parent of change
    if (props.onFilesChange) props.onFilesChange(currentFiles);
    if (props.onImagesChange)
      props.onImagesChange({files: currentFiles, urls: selectedPreviews});
  }

  if (uploadType === 'single') {
    // ...existing code for single upload...
    return (
      <div className='relative w-full aspect-square rounded-md bg-gray-200 flex items-center justify-center cursor-pointer'>
        {/* ...existing code... */}
        <div
          className={`relative flex h-12 w-12 items-center bg-gray/60 justify-center rounded-full ${
            isMenuOpen ? 'z-200' : 'z-10'
          }`}
        >
          {/* ...existing code... */}
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleSingleChange(e);
          }}
        />
      </div>
    );
  } else {
    // MULTIPLE UPLOAD UI
    return (
      <div className='w-full flex flex-col items-center border-2 border-gray-300 rounded-sm p-2 gap-2 text-center cursor-pointer relative'>
        {selectedPreviews.length === 0 && files.length === 0 && (
          <>
            <Svg icon={ADDPHOTOSVG} size={48} />
            <p className='text-gray'>
              Fotoğraflarınızı Yüklemek için Sürükleyin veya Tıklayın (max 15)
            </p>
          </>
        )}

        <input
          {...props}
          ref={multiInputRef}
          type='file'
          accept={props.accept || 'image/*'}
          multiple
          className={`absolute inset-0 opacity-0 cursor-pointer ${className || ''}`.trim()}
          disabled={files.length >= 15}
          onChange={(e) => {
            handleMultiChange(e);
          }}
        />
        {/* Preview grid */}
        {(selectedPreviews.length > 0 || files.length > 0) && (
          <div className='grid grid-cols-5 gap-1 w-full'>
            {/* Existing image URLs */}
            {selectedPreviews.map((url, idx) => (
              <div
                key={url}
                className='relative group aspect-square overflow-hidden'
              >
                <Image
                  src={url}
                  alt={`Preview ${idx + 1}`}
                  className='w-full h-full object-cover rounded-md border border-primary'
                  fill
                  sizes='20vw'
                />
                <button
                  type='button'
                  className='absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none'
                  onClick={() => {
                    // Remove preview (existing image URL)
                    const newPreviews = [...selectedPreviews];
                    newPreviews.splice(idx, 1);
                    setSelectedPreviews(newPreviews);
                    if (props.onImagesChange)
                      props.onImagesChange({files, urls: newPreviews});
                  }}
                  aria-label='Sil'
                >
                  ×
                </button>
              </div>
            ))}
            {/* New files */}
            {files.map((file, idx) => {
              const url = URL.createObjectURL(file);
              return (
                <div
                  key={url}
                  className='relative group aspect-square overflow-hidden'
                >
                  <Image
                    src={url}
                    alt={`Preview new ${idx + 1}`}
                    className='w-full h-full object-cover rounded-md shadow-md'
                    fill
                    sizes='20vw'
                  />
                  <button
                    type='button'
                    className='absolute top-1 right-1 bg-white/80 rounded-full p-1 shadow hover:bg-red-200 transition-opacity opacity-80 group-hover:opacity-100'
                    onClick={() => {
                      // Remove new file
                      const newFiles = [...files];
                      newFiles.splice(idx, 1);
                      setFiles(newFiles);
                      if (props.onImagesChange)
                        props.onImagesChange({
                          files: newFiles,
                          urls: selectedPreviews,
                        });
                    }}
                    aria-label='Sil'
                  >
                    <Svg icon={TRASHSVG} size={24} />
                  </button>
                </div>
              );
            })}
            {selectedPreviews.length + files.length < 15 && (
              <button
                type='button'
                className='flex items-center justify-center rounded-md border-2 border-dashed border-gray-400'
                onClick={() => multiInputRef.current?.click()}
              >
                <Svg icon={ADDPHOTOSVG} size={40} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
}
