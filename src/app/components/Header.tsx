'use client';

import {useState} from 'react';
import {
  ABOUTSVG,
  BARSSVG,
  CLOSESVG,
  CONTACTSVG,
  HOMESVG,
  LOGOSVG,
  PHONESVG,
  PRODUCTSSVG,
  VERTICALDOTSSVG,
} from '../utils/svg';
import Svg from './Svg';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {GlassyButton} from './GlassyButton';

/**
 * Describes behavior for Header.
 * Usage: Call Header(...) where this declaration is needed in the current module flow.
 */
export function Header() {
  const [openDropNav, setOpenDropNav] = useState(false);
  const [openRemainButtons, setOpenRemainButtons] = useState(false);
  const pathName = usePathname();
  const routes = [
    {name: 'Ana Sayfa', href: '/', icon: HOMESVG},
    {name: 'Hakkımızda', href: '/about', icon: ABOUTSVG},
    {name: 'İletişim', href: '/contact', icon: CONTACTSVG},
    {name: 'Urunler', href: '/products', icon: PRODUCTSSVG},
    {name: 'Sipariş Oluştur ve Göruntule', href: '/order', icon: HOMESVG},
  ];

  const delays = [
    'delay-100',
    'delay-200',
    'delay-300',
    'delay-400',
    'delay-500',
  ];
  return (
    <header
      className='bg-transparent flex max-w-[inherit] justify-between 
                    items-center fixed top-0 w-full p-2 z-30'
    >
      <Svg icon={LOGOSVG} className='rounded-full z-11' size={50} />
      <div className='hidden sm:flex sm:relative items-center bg-gray rounded-full p-1 gap-1'>
        <ul className='sm:flex space-x-1 text-dark-text font-medium text-lg'>
          <li key={routes.length}>
            <GlassyButton
              onClick={() => setOpenRemainButtons(!openRemainButtons)}
              icon={VERTICALDOTSSVG}
              iconSize={36}
              className={`${
                pathName === '/products' || pathName === '/order'
                  ? '[&>svg]:fill-primary '
                  : '[&>svg]:fill-dark-text '
              } `}
            />
          </li>
          {routes
            .slice(0, 3)
            .reverse()
            .map((route, index) => (
              <li key={index}>
                <Link href={route.href} className='flex items-center gap-1'>
                  <GlassyButton
                    icon={route.icon}
                    iconSize={36}
                    className={`${
                      pathName === route.href ||
                      (pathName.includes(route.href) && route.href !== '/')
                        ? '[&>svg]:fill-primary '
                        : '[&>svg]:fill-dark-text '
                    } `}
                    label={route.name}
                  />
                </Link>
              </li>
            ))}
        </ul>
        <ul
          className={`absolute top-15 left-0 bg-gray rounded-4xl p-2 gap-1 sm:flex sm:flex-col
             space-x-1 text-dark-text font-medium text-lg z-50
            transition-all duration-300
            ${openRemainButtons ? 'animate-fade-in' : 'animate-fade-out'}
            ${openRemainButtons ? 'block' : 'hidden'}`}
        >
          {routes.slice(3).map((route, index) => (
            <li key={index}>
              <Link href={route.href} className='flex items-center gap-1'>
                <GlassyButton
                  icon={route.icon}
                  iconSize={36}
                  className={`w-full ${
                    pathName === route.href ||
                    (pathName.includes(route.href) && route.href !== '/')
                      ? '[&>svg]:fill-primary '
                      : '[&>svg]:fill-dark-text '
                  } `}
                  label={route.name}
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {openDropNav ? (
        <Svg
          icon={CLOSESVG}
          className='z-11 sm:hidden'
          onClick={() => setOpenDropNav(false)}
          size={32}
        />
      ) : (
        <Svg
          icon={BARSSVG}
          className='z-11 sm:hidden'
          onClick={() => setOpenDropNav(true)}
          size={32}
        />
      )}

      <div
        className={`${openDropNav ? 'scale-y-100 delay-0' : 'scale-y-0 delay-700'} 
        transition-transform origin-top absolute top-0 left-0 sm:hidden
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
