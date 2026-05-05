import {prisma} from '@/lib/prisma';
import {AdminProductContent} from './components/ProductContent';
import Link from 'next/link';
import {GlassyButton} from '@/app/components/GlassyButton';
import {BACKSVG} from '@/app/utils/svg';

export default async function AdminProduct({
  params,
}: {
  params: {id: string} | Promise<{id: string}>;
}) {
  const product = await prisma.product.findFirst({
    where: {
      id: (await Promise.resolve(params)).id,
      active: true,
    },
  });
  return (
    <>
      <header
        className='bg-secondary/80 flex gap-4 shadow-lg
                justify-between items-center sticky top-0 w-full p-2 z-30'
      >
        <div
          className='pointer-events-auto bg-gray/90 backdrop-blur-sm 
                border border-white/30 rounded-full p-0.5 shadow-lg'
        >
          <Link href={'/admin/products'}>
            <GlassyButton
              icon={BACKSVG}
              iconSize={40}
              className='[&>svg]:stroke-3'
            />
          </Link>
        </div>
        <div className='flex flex-col'>
          <span className='text-sm sm:text-base text-end text-tertiary mr-1'>
            Produkt
          </span>
          <span className='bg-gray sm:text-lg sm:font-semibold text-secondary rounded-full p-1 px-2'>
            {product?.name}
          </span>
        </div>
      </header>
      <AdminProductContent product={product!} />
    </>
  );
}
