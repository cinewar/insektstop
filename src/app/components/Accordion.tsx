'use client';

import {ReactNode, useState} from 'react';
import Svg from './Svg';
import {DOWNSVG, EDITSVG, OKSVG, PLUSSVG, SETSVG, TRASHSVG} from '../utils/svg';
import ActionMenu from './ActionMenu';
import {GlassyButton} from './GlassyButton';

/**
 * Defines the AccordionItem type.
 * Usage: Use AccordionItem to type related values and keep data contracts consistent.
 */
export type AccordionItem = {
  id: string;
  title: ReactNode;
  price?: number;
  content: ReactNode;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

/**
 * Defines the AccordionProps type.
 * Usage: Use AccordionProps to type related values and keep data contracts consistent.
 */
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
  const [isEdit, setIsEdit] = useState(false);

  const handleToggle = (id: string) => {
    setOpenItemId((prev) => (prev === id ? null : id));
    setIsEdit(false);
  };

  return (
    <div className={className}>
      {items.map((item) => {
        const isOpen = openItemId === item.id;

        return (
          <div
            key={item.id}
            className={`shadow-custom p-1 rounded-lg  ${itemClassName} 
              ${isOpen ? 'border-2 border-primary bg-secondary' : 'bg-white'}`}
          >
            <div
              onClick={() => handleToggle(item.id)}
              className={`relative flex justify-between p-2 items-center ${isOpen ? 'shadow-md rounded-lg' : ''}`}
            >
              {!isOpen && item.price !== undefined && (
                <div className='absolute -bottom-1 left-2 text-sm text-tertiary font-semibold'>
                  £{item.price.toFixed(2)}
                </div>
              )}
              {isOpen && isEdit ? (
                <div className='' onClick={(event) => event.stopPropagation()}>
                  <form className='flex gap-1'>
                    <input
                      type='text'
                      defaultValue={
                        typeof item.title === 'string' ? item.title : ''
                      }
                      placeholder='Abschnittsname eingeben'
                      className='relative w-full p-1 placeholder:text-md placeholder:text-dark-text/50 rounded-sm 
                    border-2 focus:border-primary/50 focus:outline-0 border-gray-300'
                    />
                    <GlassyButton
                      icon={OKSVG}
                      iconSize={30}
                      className=''
                      onClick={() => setIsEdit(false)}
                    />
                  </form>
                </div>
              ) : (
                <>
                  <div className='text-md font-semibold'>{item.title}</div>
                </>
              )}

              <div className='flex'>
                {!isOpen && (
                  <ActionMenu
                    actions={[
                      {
                        id: 'edit',
                        label: 'Bearbeiten',
                        icon: EDITSVG,
                        iconSize: 40,
                        onClick: () => {
                          setIsEdit(true);
                          item.onEdit?.();
                        },
                      },
                      {
                        label: 'Löschen',
                        id: 'delete',
                        icon: TRASHSVG,
                        iconSize: 40,
                        onClick: item.onDelete,
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
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
