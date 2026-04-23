'use client';

import {ReactNode, useState} from 'react';

/**
 * Defines the AccordionItem type.
 * Usage: Use AccordionItem to type related values and keep data contracts consistent.
 */
export type AccordionItem = {
  id: string;
  title: ReactNode | ((isOpen: boolean) => ReactNode);
  processStatus?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
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

  const statusShadow = {
    pending: 'border-1 border-orange-500', // yellow
    in_progress: 'border-1 border-blue-500', // blue
    completed: 'border-1 border-green-500', // green
    cancelled: 'border-1 border-red-500', // red
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {items.map((item) => {
        const isOpen = openItemId === item.id;

        return (
          <div
            key={item.id}
            className={`
              shadow-md border ${item.processStatus ? statusShadow[item.processStatus] : ''}
              p-1 rounded-lg  ${itemClassName} 
              ${isOpen ? 'border-2 border-primary bg-secondary' : 'bg-white'}
            `}
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
