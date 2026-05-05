'use client';

import {ComponentType, SVGProps, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
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
  const [panelPosition, setPanelPosition] = useState({top: 0, left: 0});
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updateMenuPosition = () => {
      const container = containerRef.current;
      const panel = panelRef.current;
      if (!container) {
        return;
      }
      const viewportPadding = 8;
      const triggerRect = container.getBoundingClientRect();
      const panelWidth = panel?.offsetWidth ?? 220;
      const panelHeight = panel?.offsetHeight ?? 180;

      const shouldOpenToRight =
        triggerRect.right - panelWidth < viewportPadding;
      setOpenToRight(shouldOpenToRight);

      // Upward logic
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const shouldOpenUpward =
        spaceBelow < panelHeight + viewportPadding &&
        spaceAbove > panelHeight + viewportPadding;
      setOpenUpward(shouldOpenUpward);

      let left = shouldOpenToRight
        ? triggerRect.left + viewportPadding
        : triggerRect.right - panelWidth - viewportPadding;
      let top = shouldOpenUpward
        ? triggerRect.top - panelHeight - viewportPadding
        : triggerRect.bottom + viewportPadding;

      left = Math.min(
        Math.max(left, viewportPadding),
        window.innerWidth - panelWidth - viewportPadding,
      );
      top = Math.min(
        Math.max(top, viewportPadding),
        window.innerHeight - panelHeight - viewportPadding,
      );

      setPanelPosition({top, left});
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    const frame = requestAnimationFrame(updateMenuPosition);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [isOpen, actions.length]);

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

  const panelOriginClassName = openToRight
    ? openUpward
      ? 'origin-bottom-left'
      : 'origin-top-left'
    : openUpward
      ? 'origin-bottom-right'
      : 'origin-top-right';

  const shouldRenderPanel = isOpen || isClosing;

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
      {shouldRenderPanel &&
        createPortal(
          <div
            ref={panelRef}
            className={`flex flex-col p-1 pt-8 gap-1 fixed z-1000
            shadow-custom bg-gray backdrop-blur-sm 
            ${isOpen ? 'animate-fade-in scale-100' : isClosing ? 'animate-fade-out scale-95' : ''} 
            transition-all duration-200 ease-out rounded-2xl ${panelOriginClassName} ${panelStateClassName} ${menuClassName}`}
            style={{
              top: panelPosition.top,
              left: panelPosition.left,
              pointerEvents: isOpen || isClosing ? 'auto' : 'none',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <Svg
              onClick={() => {
                setIsClosing(true);
                setIsOpen(false);
              }}
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
                    setIsClosing(true);
                    setIsOpen(false);
                  }
                }}
                {...action.buttonProps}
              />
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
