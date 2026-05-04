import {Cards} from '@/app/components/Cards';
import Link from 'next/link';
import {ProductImageGallery} from '../../components/ProductImageGallery';
import {prisma} from '@/lib/prisma';

export default async function ProductPage({
  params,
}: {
  params: {productId: string};
}) {
  const {productId} = await params;

  if (!productId) {
    return (
      <div className='min-h-screen text-dark-text bg-secondary pt-18 p-4'>
        Urun bulunamadı.
      </div>
    );
  }

  const product = await prisma.product.findUnique({
    where: {id: productId},
  });

  const products = await prisma.product.findMany();

  if (!product) {
    return (
      <div className='min-h-screen text-dark-text bg-secondary pt-18 p-4'>
        Urun bulunamadı.
      </div>
    );
  }

  return (
    <div className='min-h-screen  text-dark-text bg-secondary'>
      <ProductImageGallery images={product.images} />
      <p className='bg-tertiary max-w-fit ml-2 text-white font-semibold px-4 text-lg sm:text-2xl rounded-full -translate-y-10'>
        £{product.price}
      </p>
      <div className='p-4 -my-4'>
        <div className='flex justify-between items-start text-xl sm:text-3xl font-bold'>
          <h1 className=''>{product.name}</h1>
        </div>
        <p className='text-base sm:text-lg mt-2'>{product.description}</p>
      </div>
      <div className='flex justify-center mt-2'>
        <Link
          href='/order'
          className='relative active:scale-95 transition-transform inline-flex
           items-center justify-center cursor-pointer px-8 py-2 min-w-30 bg-primary text-white text-lg font-medium rounded-[100vw] shadow-md hover:bg-tertiary z-2 shining'
        >
          Preis anfragen
        </Link>
      </div>
      <Cards products={products} />
    </div>
  );
}
