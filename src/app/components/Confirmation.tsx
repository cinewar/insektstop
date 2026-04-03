'use client';

import {GlassyButton} from './GlassyButton';
import {Modal} from './Modal';
import {CLOSESVG, OKSVG} from '../utils/svg';

type ConfirmationProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function Confirmation({
  message,
  onConfirm,
  onCancel,
}: ConfirmationProps) {
  return (
    <Modal onClose={onCancel}>
      <div className='p-2'>
        <h2 className='text-lg font-bold mb-2'>Delete Order</h2>
        <p className='text-dark-text'>{message}</p>
        <div className='flex justify-end mt-4'>
          <div className='flex gap-2 bg-gray rounded-full p-2 text-lg'>
            <GlassyButton
              onClick={onCancel}
              type='button'
              label='Cancel'
              icon={CLOSESVG}
              iconSize={32}
              className='[&>svg]:stroke-red-600 [&>svg]:stroke-4 gap-4'
            />
            <GlassyButton
              onClick={onConfirm}
              type='button'
              label='OK'
              icon={OKSVG}
              iconSize={40}
              className='[&>svg]:stroke-4 gap-4'
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
