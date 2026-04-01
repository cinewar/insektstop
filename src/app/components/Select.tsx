'use client';

import {useState} from 'react';

interface SelectProps {
  options: {value: string; label: string}[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function Select({
  options,
  value,
  onChange,
  className = '',
  placeholder,
}: SelectProps) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className={`relative w-full ${className}`}>
      <input
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`p-1 w-full placeholder:text-md placeholder:text-dark-text/50 rounded-sm 
                    border-2 focus:border-primary/50 focus:outline-0 border-gray-300`}
        placeholder={placeholder}
      />
      {isFocused && (
        <div
          className='absolute right-2 top-3 pointer-events-none
          bg-white border border-primary rounded-md shadow-lg z-10 mt-1'
        >
          {options.map((option) => (
            <option
              onClick={() => onChange(option.value)}
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </div>
      )}
    </div>
  );
}
