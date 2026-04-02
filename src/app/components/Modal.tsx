import {useState} from 'react';
import Svg from './Svg';
import {CLOSESVG} from '../utils/svg';

type ModalProps = {
  children:
    | React.ReactNode
    | ((controls: {close: () => void}) => React.ReactNode);
  onClose: () => void;
};

export function Modal({children, onClose}: ModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const close = () => {
    setIsClosing(true);
  };

  return (
    <div
      className={`fixed inset-0 bg-black/15 backdrop-blur-sm flex items-center justify-center z-50 px-2 ${
        isClosing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
      onClick={(e) => {
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
        className={`relative bg-secondary rounded-lg p-2 w-full max-w-md shadow-custom ${
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
