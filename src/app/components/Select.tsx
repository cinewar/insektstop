'use client';

import {useEffect, useRef, useState} from 'react';
import {CLOSESVG, DOWNSVG, SEARCHSVG} from '../utils/svg';
import Svg from './Svg';
import Image from 'next/image';

/**
 * Defines the SelectProps interface.
 * Usage: Implement or consume SelectProps when exchanging this structured contract.
 */
interface SelectProps {
  name?: string;
  error?: string;
  options: {value: string; label: string; image?: string}[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  className?: string;
  placeholder?: string;
}

/**
 * Describes behavior for Select.
 * Usage: Call Select(...) where this declaration is needed in the current module flow.
 */
export function Select({
  options,
  value,
  onChange,
  onBlur,
  className = '',
  placeholder,
  error,
  name,
}: SelectProps) {
  console.log(error, 'error');
  const [isOpen, setIsOpen] = useState(false);
  const [internalOptions, setInternalOptions] = useState(options);
  const [searchTerm, setSearchTerm] = useState('');
  const [internalValue, setInternalValue] = useState(value);
  const listRef = useRef<HTMLDivElement>(null);
  const [showTopGlow, setShowTopGlow] = useState(false);
  const [showBottomGlow, setShowBottomGlow] = useState(false);

  function updateGlowVisibility() {
    const element = listRef.current;

    if (!element) {
      return;
    }

    const hasOverflow = element.scrollHeight > element.clientHeight;
    const isAtTop = element.scrollTop <= 1;
    const isAtBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 1;

    setShowTopGlow(hasOverflow && !isAtTop);
    setShowBottomGlow(hasOverflow && !isAtBottom);
  }

  useEffect(() => {
    setInternalOptions(options);
  }, [options]);

  useEffect(() => {
    if (!isOpen) {
      setShowTopGlow(false);
      setShowBottomGlow(false);
      return;
    }

    const frameId = requestAnimationFrame(updateGlowVisibility);

    return () => cancelAnimationFrame(frameId);
  }, [isOpen, internalOptions]);

  /**
   * Describes behavior for handleChange.
   * Usage: Call handleChange(...) where this declaration is needed in the current module flow.
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);
    setInternalOptions(
      options.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()),
      ),
    );
  }

  return (
    <>
      <div className={`relative w-full ${className}`}>
        <input hidden name={name} value={internalValue} readOnly />
        <input
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setIsOpen(false);
            if (onBlur) {
              onBlur(internalValue);
            }
          }}
          onChange={handleChange}
          value={
            searchTerm ||
            options.find((option) => option.value === internalValue)?.label ||
            ''
          }
          className={`p-1 w-full placeholder:text-md placeholder:text-dark-text/50 rounded-sm 
                    border-2 focus:border-primary/50 focus:outline-0 border-gray-300`}
          placeholder={placeholder}
        />
        <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center'>
          {searchTerm || internalValue ? (
            <Svg
              icon={CLOSESVG}
              size={28}
              className={` text-dark-text/50 cursor-pointer
              transition-transform duration-200 ease-out 
          `}
              onClick={() => {
                setSearchTerm('');
                setInternalValue('');
                setInternalOptions(options);
                onChange('');
              }}
            />
          ) : (
            <Svg
              icon={SEARCHSVG}
              size={28}
              className=' text-dark-text/50 cursor-pointer
              transition-transform duration-200 ease-out 
              '
            />
          )}

          <Svg
            icon={DOWNSVG}
            size={40}
            onClick={() => setIsOpen(!isOpen)}
            className={` text-gray-400 transition-transform duration-200 
            ease-out ${isOpen ? 'rotate-180 scale-105' : 'rotate-0 scale-100'}`}
          />
        </div>
        {isOpen && (
          <div
            className='absolute rounded-md bg-gray shadow-lg z-50 w-full 
              right-0 top-9 overflow-hidden'
          >
            <div
              ref={listRef}
              onScroll={updateGlowVisibility}
              className='max-h-80 overflow-auto flex flex-col gap-1 p-2'
            >
              {internalOptions.map((option) => (
                <div
                  className={`px-2 py-1 cursor-pointer shadow-custom rounded-md p-4 bg-secondary
                    active:scale-95 transition-transform duration-100} flex items-center gap-2
                 ${option.value === value ? 'bg-primary/20' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(option.value);
                    setInternalValue(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                    setInternalOptions(options);
                  }}
                  key={option.value}
                >
                  {option.image && (
                    <Image
                      src={option.image}
                      alt='product image'
                      width={40}
                      height={40}
                      className='rounded-full aspect-square object-cover'
                    />
                  )}
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
            {showTopGlow && (
              <div className='pointer-events-none absolute top-0 left-0 w-full h-4 bg-linear-to-b from-dark-text/50 to-secondary/50' />
            )}
            {showBottomGlow && (
              <div className='pointer-events-none absolute bottom-0 left-0 w-full h-4 bg-linear-to-t from-dark-text/50 to-secondary/50' />
            )}
          </div>
        )}
      </div>
      {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
    </>
  );
}
