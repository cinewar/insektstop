'use client';

import {ComponentType, SVGProps, useState} from 'react';
import Svg from './Svg';
import {CLOSESVG, VERTICALDOTSSVG} from '../utils/svg';
import {RoundedButton} from './RoundedButton';

export type ActionMenuAction = {
  id: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconSize?: number;
  className?: string;
  closeOnClick?: boolean;
  onClick?: () => void;
  buttonProps?: Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'className' | 'onClick'
  >;
};

type ActionMenuProps = {
  actions: ActionMenuAction[];
  className?: string;
  menuClassName?: string;
  triggerIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  triggerSize?: number;
  direction?: 'horizontal' | 'vertical';
};

export default function ActionMenu({
  actions,
  className = '',
  menuClassName = '',
  triggerIcon = VERTICALDOTSSVG,
  triggerSize = 40,
  direction = 'horizontal',
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isVertical = direction === 'vertical';

  const panelPositionClassName = isVertical
    ? 'top-0 -right-2 mt-2 flex-col rounded-3xl py-2 origin-top-right'
    : '-top-2 right-0 rounded-[100vw] px-2 origin-right';

  const panelStateClassName = isVertical
    ? isOpen
      ? 'opacity-100 translate-y-0 scale-y-100 pointer-events-auto'
      : 'opacity-0 -translate-y-2 scale-y-0 pointer-events-none'
    : isOpen
      ? 'opacity-100 translate-x-0 scale-x-100 pointer-events-auto'
      : 'opacity-0 translate-x-1 scale-x-0 pointer-events-none';

  return (
    <div
      className={`relative flex gap-1 ${className}`}
      onClick={(event) => event.stopPropagation()}
    >
      <Svg
        onClick={() => setIsOpen((prev) => !prev)}
        icon={triggerIcon}
        size={triggerSize}
        className='transition-transform duration-200 active:scale-95'
      />
      <div
        className={`flex gap-1 absolute z-10 border border-primary 
            shadow-custom bg-secondary/50 backdrop-blur-sm transition-all duration-200 
            ease-out ${panelPositionClassName} ${panelStateClassName} ${menuClassName}`}
      >
        <Svg
          onClick={() => setIsOpen(false)}
          icon={CLOSESVG}
          size={triggerSize}
          className='transition-transform duration-200 active:scale-95'
        />
        {actions.map((action) => (
          <RoundedButton
            key={action.id}
            icon={action.icon}
            iconSize={action.iconSize ?? triggerSize}
            className={action.className ?? ''}
            onClick={() => {
              action.onClick?.();

              if (action.closeOnClick ?? true) {
                setIsOpen(false);
              }
            }}
            {...action.buttonProps}
          />
        ))}
      </div>
    </div>
  );
}
