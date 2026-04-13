'use client';

import {GlassyButton} from './GlassyButton';
import {Modal} from './Modal';
import {CLOSESVG, OKSVG} from '../utils/svg';
import {Loading} from './Loading';

/**
 * Defines the ConfirmationProps type.
 * Usage: Use ConfirmationProps to type related values and keep data contracts consistent.
 */
type ConfirmationProps = {
  title?: string;
  message: string;
  onConfirmAction: () => void;
  onCancelAction: () => void;
  isLoading?: boolean;
};

/**
 * Describes behavior for Confirmation.
 * Usage: Call Confirmation(...) where this declaration is needed in the current module flow.
 */
export function Confirmation({
  title = 'Siparişi Sil',
  message,
  onConfirmAction,
  onCancelAction,
  isLoading = false,
}: ConfirmationProps) {
  return (
    <Modal onClose={onCancelAction}>
      <div className='relative p-2'>
        {isLoading && (
          <Loading className='absolute inset-0 z-50 rounded-lg bg-secondary/75' />
        )}
        <h2 className='text-lg font-bold mb-2'>{title}</h2>
        <p className='text-dark-text'>{message}</p>
        <div className='flex justify-end mt-4'>
          <div className='flex gap-2 bg-gray/90 backdrop-blur-sm border border-white/30 rounded-full p-2 text-lg shadow-lg'>
            <GlassyButton
              onClick={onCancelAction}
              type='button'
              label='İptal'
              icon={CLOSESVG}
              iconSize={32}
              disabled={isLoading}
              className='[&>svg]:stroke-red-600 [&>svg]:stroke-4 gap-4'
            />
            <GlassyButton
              onClick={onConfirmAction}
              type='button'
              label='Tamam'
              icon={OKSVG}
              iconSize={40}
              disabled={isLoading}
              className='[&>svg]:stroke-4 gap-4'
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
