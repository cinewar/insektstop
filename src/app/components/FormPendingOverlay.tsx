import {Loading} from '@/app/components/Loading';
import {useFormStatus} from 'react-dom';

export function FormPendingOverlay() {
  const {pending} = useFormStatus();

  if (!pending) {
    return null;
  }

  return (
    <Loading className='absolute inset-0 z-50 rounded-lg bg-secondary/75' />
  );
}
