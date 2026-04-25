import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useSessionUserStore} from './LayoutClientWrapper';
import {CONTACTSVG, HOMESVG, INFOSVG, PRODUCTSSVG, USERSVG} from '../utils/svg';
import Svg from './Svg';

/**
 * Describes behavior for Footer.
 * Usage: Call Footer(...) where this declaration is needed in the current module flow.
 */
export function Footer({openLogin}: {openLogin?: () => void}) {
  const sessionUser = useSessionUserStore((state) => state.sessionUser);
  const router = useRouter();
  return (
    <footer className='w-full text-center py-4 bg-dark-text text-primary mt-auto'>
      <ul className='flex justify-start gap-1 pl-4 mb-2'>
        <li>
          <Link href='/' className='hover:underline'>
            <Svg icon={HOMESVG} size={32} />
          </Link>
        </li>
        <li>
          <Link href='/about' className='hover:underline'>
            <Svg icon={INFOSVG} size={32} />
          </Link>
        </li>
        <li>
          <Link href='/contact' className='hover:underline'>
            <Svg icon={CONTACTSVG} size={32} />
          </Link>
        </li>
        <li>
          <Link href='/products' className='hover:underline'>
            <Svg icon={PRODUCTSSVG} size={32} />
          </Link>
        </li>
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
              <Svg icon={USERSVG} className='[svg]:fill-primary' size={32} />
            </button>
          </li>
        )}
      </ul>
      <div className='text-sm text-secondary'>
        &copy; {new Date().getFullYear()} Insektstop. Tum haklari saklidir.
      </div>
    </footer>
  );
}
