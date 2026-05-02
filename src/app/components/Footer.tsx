import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useSessionUserStore} from './LayoutClientWrapper';
import {
  CONTACTSVG,
  FACEBOOKSVG,
  HOMESVG,
  INFOSVG,
  INSTAGRAMSVG,
  PRODUCTSSVG,
  USERSVG,
} from '../utils/svg';
import Svg from './Svg';
import {User} from '../../../generated/prisma';

/**
 * Describes behavior for Footer.
 * Usage: Call Footer(...) where this declaration is needed in the current module flow.
 */
export function Footer({
  user,
  openLogin,
}: {
  user: User | null;
  openLogin?: () => void;
}) {
  const sessionUser = useSessionUserStore((state) => state.sessionUser);
  const router = useRouter();

  const routes = [
    {href: '/', icon: HOMESVG},
    {href: '/about', icon: INFOSVG},
    {href: '/contact', icon: CONTACTSVG},
    {href: '/products', icon: PRODUCTSSVG},
    {href: user?.facebook ? user.facebook : '#', icon: FACEBOOKSVG},
    {href: user?.instagram ? user.instagram : '#', icon: INSTAGRAMSVG},
  ];
  return (
    <footer className='w-full text-center py-2 bg-dark-text text-primary mt-auto'>
      <ul className='flex justify-start gap-1 pl-4'>
        {routes.map((route, index) => (
          <li key={index}>
            <Link href={route.href} className='hover:underline'>
              <Svg icon={route.icon} size={32} className='w-8 sm:w-12' />
            </Link>
          </li>
        ))}

        {openLogin && (
          <li>
            <button
              className='cursor-pointer text-primary'
              onClick={() => {
                if (sessionUser) {
                  router.push('/admin');
                  return;
                } // Eğer kullanıcı zaten giriş yapmışsa admin sayfasına yönlendir
                openLogin();
              }}
            >
              <Svg
                icon={USERSVG}
                size={32}
                className=' [svg]:fill-primary w-8 sm:w-12'
              />
            </button>
          </li>
        )}
      </ul>
      <div className='text-sm text-secondary'>
        &copy; {new Date().getFullYear()} Insektstop. Alle Rechte vorbehalten.
      </div>
    </footer>
  );
}
