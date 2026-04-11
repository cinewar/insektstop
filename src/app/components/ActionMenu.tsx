'use client';

import {ComponentType, SVGProps, useEffect, useRef, useState} from 'react';
import Svg from './Svg';
import {CLOSESVG, VERTICALDOTSSVG} from '../utils/svg';
import {GlassyButton} from './GlassyButton';

/**
  * Defines the ActionMenuAction type.
  * Usage: Use ActionMenuAction to type related values and keep data contracts consistent.
  */
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

/**
  * Defines the ActionMenuProps type.
  * Usage: Use ActionMenuProps to type related values and keep data contracts consistent.
  */
type ActionMenuProps = {
  actions: ActionMenuAction[];
  className?: string;
  menuClassName?: string;
  triggerIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  triggerSize?: number;
  direction?: 'horizontal' | 'vertical';
  onOpenChangeAction?: (isOpen: boolean) => void;
};

export default function ActionMenu({
  actions,
  className = '',
  menuClassName = '',
  triggerIcon = VERTICALDOTSSVG,
  triggerSize = 40,
  onOpenChangeAction,
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openToRight, setOpenToRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updateMenuSide = () => {
      const container = containerRef.current;
      const panel = panelRef.current;

      if (!container || !panel) {
        return;
      }

      const viewportPadding = 8;
      const triggerRect = container.getBoundingClientRect();
      const panelWidth = panel.getBoundingClientRect().width;
      const leftAlignedStartX = triggerRect.right - panelWidth;

      setOpenToRight(leftAlignedStartX < viewportPadding);
    };

    updateMenuSide();
    window.addEventListener('resize', updateMenuSide);

    return () => {
      window.removeEventListener('resize', updateMenuSide);
    };
  }, [isOpen]);

  useEffect(() => {
    onOpenChangeAction?.(isOpen);
  }, [isOpen, onOpenChangeAction]);

  const panelStateClassName = isOpen
    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
    : 'opacity-0 -translate-y-2 scale-95 pointer-events-none';

  const panelSideClassName = openToRight
    ? 'left-2 origin-top-left'
    : 'right-2 origin-top-right';

  return (
    <div
      ref={containerRef}
      className={`relative flex gap-1 ${className}`}
      style={isOpen ? {zIndex: 300} : undefined}
      onClick={(event) => event.stopPropagation()}
    >
      <Svg
        onClick={() => setIsOpen((prev) => !prev)}
        icon={triggerIcon}
        size={triggerSize}
        className='transition-transform duration-200 active:scale-95'
      />
      <div
        ref={panelRef}
        className={`flex flex-col pt-8 p-1 gap-2 absolute z-310
            shadow-custom bg-gray backdrop-blur-sm transition-all duration-200 
            ease-out top-0 mt-2 py-2 rounded-2xl ${panelSideClassName} ${panelStateClassName} ${menuClassName}`}
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
            type='button'
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
