import {Loading} from '@/app/components/Loading';
import {useFormStatus} from 'react-dom';

/**
 * Describes behavior for FormPendingOverlay.
 * Usage: Call FormPendingOverlay(...) where this declaration is needed in the current module flow.
 */
export function FormPendingOverlay() {
  const {pending} = useFormStatus();

  if (!pending) {
    return null;
  }

  return (
    <Loading className='absolute inset-0 z-50 rounded-lg bg-secondary/75' />
  );
}
