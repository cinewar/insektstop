import {GlassyButton} from '@/app/components/GlassyButton';
import {CLOSESVG, OKSVG} from '@/app/utils/svg';
import {useFormStatus} from 'react-dom';

interface FormActionsProps {
  close: () => void;
  label: string;
}

export function FormActions({close, label}: FormActionsProps) {
  const {pending} = useFormStatus();

  return (
    <div className='flex justify-end mt-4'>
      <div className='flex gap-2 bg-gray rounded-full p-2 text-lg'>
        <GlassyButton
          onClick={close}
          type='button'
          label='Cancel'
          icon={CLOSESVG}
          iconSize={32}
          disabled={pending}
          className='[&>svg]:stroke-red-600 [&>svg]:stroke-4 gap-4'
        />
        <GlassyButton
          label={label}
          icon={OKSVG}
          iconSize={40}
          type='submit'
          disabled={pending}
          className='[&>svg]:stroke-4 gap-4'
        />
      </div>
    </div>
  );
}
