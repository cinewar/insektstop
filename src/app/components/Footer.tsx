import Link from 'next/link';

export function Footer() {
  return (
    <footer className='w-full text-center py-4 bg-dark-text text-primary mt-auto'>
      <ul className='flex justify-between px-12 mb-2'>
        <li>
          <Link href='/' className='hover:underline'>
            Home
          </Link>
        </li>
        <li>
          <Link href='/about' className='hover:underline'>
            About
          </Link>
        </li>
        <li>
          <Link href='/contact' className='hover:underline'>
            Contact
          </Link>
        </li>
        <li>
          <Link href='/products' className='hover:underline'>
            Products
          </Link>
        </li>
      </ul>
      <div className='text-sm text-secondary'>
        &copy; {new Date().getFullYear()} Insektstop. All rights reserved.
      </div>
    </footer>
  );
}
