import {Loading} from '@/app/components/Loading';
import {useFormStatus} from 'react-dom';
import {useEffect, useState} from 'react';

/**
 * Describes behavior for FormPendingOverlay.
 * Usage: Call FormPendingOverlay(...) where this declaration is needed in the current module flow.
 */
export function FormPendingOverlay() {
  const {pending} = useFormStatus();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (pending) {
      timer = setTimeout(() => setShow(true), 800);
    } else {
      setShow(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pending]);

  if (!pending || !show) {
    return null;
  }

  return (
    <Loading className='absolute inset-0 z-50 rounded-lg bg-secondary/75' />
  );
}
