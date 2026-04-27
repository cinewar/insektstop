'use client';

import {usePathname} from 'next/navigation';
import {AdminHeader} from './AdminHeader';
import {GlassyButton} from '@/app/components/GlassyButton';
import {HOMESVG} from '@/app/utils/svg';

export function AdminLayoutWrapper({children}: {children: React.ReactNode}) {
  const path = usePathname();
  const pathParts = path.split('/').filter(Boolean);
  const isOrderProductDetailPage =
    (pathParts.length === 3 &&
      pathParts[0] === 'admin' &&
      pathParts[1] === 'orders' &&
      pathParts[2] !== null) ||
    (pathParts.length === 3 &&
      pathParts[0] === 'admin' &&
      pathParts[1] === 'products' &&
      pathParts[2] !== null);

  return (
    <div className='min-h-screen bg-secondary'>
      {!isOrderProductDetailPage && <AdminHeader />}
      {children}
    </div>
  );
}
