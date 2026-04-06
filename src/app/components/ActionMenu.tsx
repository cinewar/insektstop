'use client';

import {ComponentType, SVGProps, useState} from 'react';
import Svg from './Svg';
import {CLOSESVG, VERTICALDOTSSVG} from '../utils/svg';
import {GlassyButton} from './GlassyButton';

export type ActionMenuAction = {
  id: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconSize?: number;
  label?: string;
  href?: string;
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

  const panelStateClassName = isOpen
    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
    : 'opacity-0 -translate-y-2 scale-95 pointer-events-none';

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
        className={`flex flex-col pt-8 p-1 gap-2 absolute z-50
            shadow-custom bg-gray backdrop-blur-sm transition-all duration-200 
            ease-out top-0 right-2 mt-2 py-2 rounded-2xl origin-top-right ${panelStateClassName} ${menuClassName}`}
      >
        <Svg
          onClick={() => setIsOpen(false)}
          icon={CLOSESVG}
          size={28}
          className='absolute top-1 right-1 transition-transform text-mid-magenta duration-200 active:scale-95'
        />
        {actions.map((action) => (
          <GlassyButton
            label={action.label}
            key={action.id}
            icon={action.icon}
            iconSize={action.iconSize ?? triggerSize}
            className={`gap-3 ${action.className}`}
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
