'use client';
import {usePathname} from 'next/navigation';

export default function ShowHeader({children}: {children: React.ReactNode}) {
  const pathname = usePathname();
  // Hide Header on /admin and all subroutes
  if (pathname.startsWith('/admin')) {
    return null;
  }
  return <>{children}</>;
}
