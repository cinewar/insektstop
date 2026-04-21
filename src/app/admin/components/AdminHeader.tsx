'use client';

import Svg from '@/app/components/Svg';
import {HOMESVG} from '@/app/utils/svg';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

export function AdminHeader() {
  const pathName = usePathname();
  const adminLinks = [
    {href: '/admin', label: 'Admin', icon: HOMESVG},
    {href: '/admin/orders', label: 'Siparişler', icon: HOMESVG},
    {href: '/admin/products', label: 'Ürünler', icon: HOMESVG},
  ];
  return (
    <header
      className='bg-secondary/80 flex max-w-120 shadow-lg
                    justify-between items-center sticky top-0 w-full pt-2 z-30'
    >
      {adminLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-base flex flex-col items-center justify-center w-full ${
            pathName === link.href
              ? 'text-primary border-b-2 border-primary'
              : 'text-dark-text'
          }`}
        >
          <Svg
            icon={link.icon}
            className={`${pathName === link.href ? '[*>svg]:fill-primary' : '[*>svg]:fill-dark-text'}`}
            size={40}
          />
          {link.label}
        </Link>
      ))}
    </header>
  );
}
