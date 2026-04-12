'use client';

import {parseAsString, useQueryState} from 'nuqs';
import {CLOSESVG, SEARCHSVG} from '../utils/svg';
import Svg from './Svg';
import {Input} from './Input';

/**
 * Defines the SearchProps interface.
 * Usage: Implement or consume SearchProps when exchanging this structured contract.
 */
interface SearchProps {
  placeholder?: string;
  paramKey?: string;
  className?: string;
}

/**
 * Describes behavior for Search.
 * Usage: Call Search(...) where this declaration is needed in the current module flow.
 */
export function Search({
  placeholder = 'Urun ara...',
  paramKey = 'q',
}: SearchProps) {
  const [query, setQuery] = useQueryState(
    paramKey,
    parseAsString.withOptions({shallow: false}),
  );

  return (
    <div className='relative flex w-full'>
      <Input
        value={query ?? ''}
        onChange={(e) => setQuery(e.target.value || null)}
        type='text'
        placeholder={placeholder}
        className='relative ml-4 w-full p-2 placeholder:text-md placeholder:text-dark-text/50 rounded-sm 
          border-2 focus:border-primary/50 focus:outline-0 border-gray-300'
      />
      <Svg
        onClick={() => {
          if (query) setQuery(null);
        }}
        icon={query ? CLOSESVG : SEARCHSVG}
        size={40}
        className='absolute right-2'
      />
    </div>
  );
}
