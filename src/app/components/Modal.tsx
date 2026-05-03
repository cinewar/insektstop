import {useState} from 'react';
import Svg from './Svg';
import {CLOSESVG} from '../utils/svg';

/**
 * Defines the ModalProps type.
 * Usage: Use ModalProps to type related values and keep data contracts consistent.
 */
type ModalProps = {
  overFlow?: boolean;
  children:
    | React.ReactNode
    | ((controls: {close: () => void}) => React.ReactNode);
  onClose: () => void;
};

/**
 * Describes behavior for Modal.
 * Usage: Call Modal(...) where this declaration is needed in the current module flow.
 */
export function Modal({children, onClose, overFlow = false}: ModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const close = () => {
    setIsClosing(true);
  };

  return (
    <div
      className={`fixed inset-0 text-dark-text bg-black/15 backdrop-blur-sm flex items-center justify-center z-50 px-2 ${
        isClosing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) {
          close();
        }
      }}
      onAnimationEnd={() => {
        if (isClosing) {
          onClose();
        }
      }}
    >
      <div
        className={`relative ${overFlow ? 'overflow-y-auto' : ''} max-h-[80vh] bg-secondary rounded-lg p-2 
            w-full max-w-md shadow-custom ${
              isClosing ? 'animate-fade-out' : 'animate-fade-in'
            }`}
      >
        <Svg
          icon={CLOSESVG}
          size={32}
          className='absolute top-2 right-2 cursor-pointer z-55'
          onClick={close}
        />
        {typeof children === 'function' ? children({close}) : children}
      </div>
    </div>
  );
}
