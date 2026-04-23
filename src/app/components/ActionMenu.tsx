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
  const [isClosing, setIsClosing] = useState(false);
  const [openToRight, setOpenToRight] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updateMenuPosition = () => {
      const container = containerRef.current;
      const panel = panelRef.current;
      if (!container || !panel) {
        return;
      }
      const viewportPadding = 8;
      const triggerRect = container.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const panelWidth = panelRect.width;
      const panelHeight = panelRect.height;
      const leftAlignedStartX = triggerRect.right - panelWidth;
      setOpenToRight(leftAlignedStartX < viewportPadding);

      // Upward logic
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      if (
        spaceBelow < panelHeight + viewportPadding &&
        spaceAbove > panelHeight + viewportPadding
      ) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [isOpen]);

  useEffect(() => {
    onOpenChangeAction?.(isOpen);
  }, [isOpen, onOpenChangeAction]);

  // Handle close animation
  useEffect(() => {
    if (!isOpen && isClosing) {
      const timeout = setTimeout(() => setIsClosing(false), 220);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, isClosing]);

  const panelStateClassName = isOpen
    ? 'block translate-y-0 pointer-events-auto'
    : openUpward
      ? 'hidden -translate-y-2 scale-95 pointer-events-none'
      : 'hidden translate-y-2 scale-95 pointer-events-none';

  const panelSideClassName = openToRight
    ? openUpward
      ? 'left-2 origin-bottom-left'
      : 'left-2 origin-top-left'
    : openUpward
      ? 'right-2 origin-bottom-right'
      : 'right-2 origin-top-right';

  return (
    <div
      ref={containerRef}
      className={`relative flex gap-1 ${className}`}
      style={isOpen ? {zIndex: 300} : undefined}
      onClick={(event) => event.stopPropagation()}
    >
      <Svg
        onClick={() => {
          if (isOpen) {
            setIsClosing(true);
            setIsOpen(false);
          } else {
            setIsOpen(true);
          }
        }}
        icon={triggerIcon}
        size={triggerSize}
        className='transition-transform duration-200 active:scale-95'
      />
      <div
        ref={panelRef}
        className={`flex flex-col p-1 pt-8 gap-2 absolute z-310
        shadow-custom bg-gray backdrop-blur-sm 
        ${isOpen ? 'animate-fade-in scale-100' : isClosing ? 'animate-fade-out scale-95' : ''} 
        transition-all duration-200 ease-out 
        ${openUpward ? 'bottom-0 mb-2' : 'top-0 mt-2'} rounded-2xl ${panelSideClassName} ${panelStateClassName} ${menuClassName}`}
        style={{pointerEvents: isOpen || isClosing ? 'auto' : 'none'}}
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
