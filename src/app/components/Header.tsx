'use client';

import {useState} from 'react';
import {
  ABOUTSVG,
  BARSSVG,
  CLOSESVG,
  CONTACTSVG,
  HOMESVG,
  LOGOSVG,
  PRODUCTSSVG,
} from '../utils/svg';
import Svg from './Svg';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

export function Header() {
  const [openDropNav, setOpenDropNav] = useState(false);
  const pathName = usePathname();
  const routes = [
    {name: 'Home', href: '/', icon: HOMESVG},
    {name: 'Create & Check Order', href: '/order', icon: HOMESVG},
    {name: 'About', href: '/about', icon: ABOUTSVG},
    {name: 'Contact', href: '/contact', icon: CONTACTSVG},
    {name: 'Products', href: '/products', icon: PRODUCTSSVG},
  ];

  const delays = [
    'delay-100',
    'delay-200',
    'delay-300',
    'delay-400',
    'delay-500',
  ];
  return (
    <header className='bg-transparent flex max-w-120 justify-between items-center fixed top-0 w-full p-2 z-30'>
      <Svg icon={LOGOSVG} className='rounded-full z-11' size={50} />
      {openDropNav ? (
        <Svg
          icon={CLOSESVG}
          className='z-11'
          onClick={() => setOpenDropNav(false)}
          size={32}
        />
      ) : (
        <Svg
          icon={BARSSVG}
          className='z-11'
          onClick={() => setOpenDropNav(true)}
          size={32}
        />
      )}

      <div
        className={`${openDropNav ? 'scale-y-100 delay-0' : 'scale-y-0 delay-700'} 
        transition-transform origin-top absolute top-0 left-0
         bg-gray rounded-lg shadow-custom p-4 pt-18 w-full`}
      >
        <ul className='space-y-2 text-dark-text font-medium text-lg'>
          {routes.map((route, index) => (
            <li key={index}>
              <Link
                href={route.href}
                className={`bg-secondary ${
                  openDropNav
                    ? `scale-y-100 opacity-100 ${delays[index]}`
                    : `scale-y-0 opacity-50 ${delays[delays.length - 1 - index]} `
                } 
                    flex justify-between items-center px-4 py-2 shadow-custom
                    ${
                      pathName === route.href ||
                      (pathName.includes(route.href) && route.href !== '/')
                        ? '[&>svg]:fill-primary text-primary'
                        : '[&>svg]:fill-tertiary text-dark-text '
                    } 
                    rounded`}
              >
                <span>{route.name}</span>
                <Svg icon={route.icon} size={32} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
