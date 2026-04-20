import Link from 'next/link';

/**
 * Describes behavior for Footer.
 * Usage: Call Footer(...) where this declaration is needed in the current module flow.
 */
export function Footer({openLogin}: {openLogin?: () => void}) {
  return (
    <footer className='w-full text-center py-4 bg-dark-text text-primary mt-auto'>
      <ul className='flex justify-between px-12 mb-2'>
        <li>
          <Link href='/' className='hover:underline'>
            Ana Sayfa
          </Link>
        </li>
        <li>
          <Link href='/about' className='hover:underline'>
            Hakkımızda
          </Link>
        </li>
        <li>
          <Link href='/contact' className='hover:underline'>
            İletişim
          </Link>
        </li>
        <li>
          <Link href='/products' className='hover:underline'>
            Urunler
          </Link>
        </li>
        {openLogin && (
          <li>
            <button
              className='hover:underline text-primary'
              onClick={openLogin}
            >
              Admin
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
