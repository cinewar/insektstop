'use client';

import {ReactNode, useState} from 'react';

/**
 * Defines the AccordionItem type.
 * Usage: Use AccordionItem to type related values and keep data contracts consistent.
 */
export type AccordionItem = {
  id: string;
  title: ReactNode | ((isOpen: boolean) => ReactNode);
  processStatus?: 'pending' | 'processing' | 'completed' | 'cancelled';
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

export default function NewAccordion({
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

  const statusColorShade = {
    pending: 'shadow-[0_0_10px_rgba(255,71,249,0.45)]',
    processing: 'shadow-[0_0_10px_rgba(255,71,249,0.45)]',
    completed: 'shadow-[0_0_10px_rgba(255,71,249,0.45)]',
    cancelled: 'shadow-[0_0_10px_rgba(255,71,249,0.45)]',
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {items.map((item) => {
        const isOpen = openItemId === item.id;

        return (
          <div
            key={item.id}
            className={`${
              item.processStatus
                ? statusColorShade[item.processStatus]
                : 'shadow-custom'
            } p-1 rounded-lg  ${itemClassName} 
              ${isOpen ? 'border-2 border-primary bg-secondary' : 'bg-white'}`}
          >
            <div
              onClick={() => handleToggle(item.id)}
              className={`relative flex justify-between p-2 items-center ${isOpen ? 'shadow-md rounded-lg' : ''}`}
            >
              {typeof item.title === 'function'
                ? item.title(isOpen)
                : item.title}
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
