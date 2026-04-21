import {GlassyButton} from '@/app/components/GlassyButton';
import {CLOSESVG, LOGINSVG, OKSVG} from '@/app/utils/svg';
import {useFormStatus} from 'react-dom';

/**
 * Defines the FormActionsProps interface.
 * Usage: Implement or consume FormActionsProps when exchanging this structured contract.
 */
interface FormActionsProps {
  close?: () => void;
  label: string;
  login?: boolean;
  disabled?: boolean;
}

/**
 * Describes behavior for FormActions.
 * Usage: Call FormActions(...) where this declaration is needed in the current module flow.
 */
export function FormActions({close, label, login, disabled}: FormActionsProps) {
  const {pending} = useFormStatus();

  return (
    <div className='flex justify-end mt-4'>
      <div className='flex gap-2 bg-gray/90 backdrop-blur-sm border border-white/30 rounded-full p-2 text-lg shadow-lg'>
        {close && (
          <GlassyButton
            onClick={close}
            type='button'
            label='İptal'
            icon={CLOSESVG}
            iconSize={32}
            disabled={pending}
            className='[&>svg]:stroke-red-600 [&>svg]:stroke-4 gap-4'
          />
        )}
        <GlassyButton
          label={label}
          icon={login ? LOGINSVG : OKSVG}
          iconSize={40}
          type='submit'
          disabled={pending || disabled}
          className={login ? 'gap-4' : '[&>svg]:stroke-4 gap-4'}
        />
      </div>
    </div>
  );
}
