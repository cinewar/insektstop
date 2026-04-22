'use client';

import {GlassyButton} from '@/app/components/GlassyButton';
import Svg from '@/app/components/Svg';
import {HOMESVG, ORDERSVG, PRODUCTSSVG, USERSVG} from '@/app/utils/svg';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

export function AdminHeader() {
  const pathName = usePathname();
  const adminLinks = [
    {href: '/admin', label: 'Admin', icon: USERSVG},
    {href: '/admin/orders', label: 'Siparişler', icon: ORDERSVG},
    {href: '/admin/products', label: 'Ürünler', icon: PRODUCTSSVG},
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
            pathName === link.href ? 'text-primary' : 'text-dark-text'
          }`}
        >
          <div
            className='pointer-events-auto bg-gray/90 backdrop-blur-sm 
                    border border-white/30 rounded-full p-0.5 shadow-lg'
          >
            <GlassyButton
              icon={link.icon}
              iconSize={36}
              className={`gap-1 ${pathName === link.href ? '[&>svg]:fill-primary' : '[&>svg]:fill-dark-text'}`}
            />
          </div>
          {link.label}
        </Link>
      ))}
    </header>
  );
}
