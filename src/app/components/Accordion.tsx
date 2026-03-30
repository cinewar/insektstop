'use client';

import {ReactNode, useState} from 'react';
import Svg from './Svg';
import {DOWNSVG, PLUSSVG, SETSVG, TRASHSVG} from '../utils/svg';
import ActionMenu from './ActionMenu';

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
              onClick={() => handleToggle(item.id)}
              className={`flex justify-between p-2 items-center ${isOpen ? 'shadow-md rounded-lg' : ''}`}
            >
              <div className='text-md font-semibold'>{item.title}</div>
              <div className='flex'>
                {isOpen && (
                  <ActionMenu
                    actions={[
                      {
                        id: 'add',
                        icon: PLUSSVG,
                        iconSize: 40,
                        onClick: () =>
                          console.log('Add action clicked for item', item.id),
                      },
                      {
                        id: 'edit',
                        icon: SETSVG,
                        iconSize: 40,
                        onClick: () =>
                          console.log('Edit action clicked for item', item.id),
                      },
                      {
                        id: 'delete',
                        icon: TRASHSVG,
                        iconSize: 40,
                        onClick: () =>
                          console.log(
                            'Delete action clicked for item',
                            item.id,
                          ),
                      },
                    ]}
                  />
                )}
                <Svg
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
