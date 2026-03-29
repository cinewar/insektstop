'use client';

import {ReactNode, useState} from 'react';
import Svg from './Svg';
import {DOWNSVG, SETSVG, TRASHSVG} from '../utils/svg';
import {RoundedButton} from './RoundedButton';

export type AccordionItem = {
  id: string;
  title: ReactNode;
  content: ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
  itemClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

export default function Accordion({
  items,
  className = '',
  itemClassName = '',
  contentClassName = '',
}: AccordionProps) {
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenItemId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={className}>
      {items.map((item) => {
        const isOpen = openItemId === item.id;

        return (
          <div
            key={item.id}
            className={`shadow-custom p-1 rounded-lg overflow-hidden  ${itemClassName} 
              ${isOpen ? 'border-2 border-primary bg-secondary' : 'bg-white'}`}
          >
            <div
              className={`flex justify-between p-2 items-center ${isOpen ? 'shadow-md rounded-lg' : ''}`}
            >
              <div className='text-md font-semibold'>{item.title}</div>
              <div className='flex'>
                {isOpen && (
                  <div className='flex gap-1'>
                    <RoundedButton icon={SETSVG} iconSize={40} className='' />
                    <RoundedButton icon={TRASHSVG} iconSize={40} className='' />
                  </div>
                )}
                <Svg
                  onClick={() => handleToggle(item.id)}
                  icon={DOWNSVG}
                  size={40}
                  className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </div>

            {isOpen && (
              <div
                className={`px-1 pb-3 text-sm text-dark-text border-t border-gray-100 ${contentClassName}`}
              >
                <div className='flex px-1 font-semibold py-2'>
                  <span className='flex-3'>Product</span>
                  <span className='flex-1'>Width(m)</span>
                  <span className='flex-1'>Length(m)</span>
                </div>
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
