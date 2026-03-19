'use client';

import {parseAsString, useQueryState} from 'nuqs';
import {CLOSESVG, SEARCHSVG} from '../utils/svg';
import Svg from './Svg';

interface SearchProps {
  placeholder?: string;
  paramKey?: string;
}

export function Search({
  placeholder = 'Search products...',
  paramKey = 'q',
}: SearchProps) {
  const [query, setQuery] = useQueryState(
    paramKey,
    parseAsString.withOptions({shallow: false}),
  );

  return (
    <div className='relative flex w-full'>
      <input
        value={query ?? ''}
        onChange={(e) => setQuery(e.target.value || null)}
        type='text'
        placeholder={placeholder}
        className='relative ml-4 w-full p-2 placeholder:text-xl placeholder:text-dark-text/50 rounded-sm 
                    border-2 focus:border-primary/50 focus:outline-0 border-gray-300'
      />
      <Svg
        onClick={() => {
          if (query) setQuery('');
        }}
        icon={query ? CLOSESVG : SEARCHSVG}
        size={40}
        className='absolute right-2'
      />
    </div>
  );
}
