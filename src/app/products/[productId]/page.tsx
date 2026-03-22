import {Cards} from '@/app/components/Cards';
import products from '@/lib/products.json';
import Link from 'next/link';
import {ProductImageGallery} from '../../components/ProductImageGallery';

export default async function ProductPage({
  params,
}: {
  params: {productId: string};
}) {
  const {productId} = await params;
  const product = products.find((p) => p.id.toString() === productId);

  if (!product) {
    return (
      <div className='min-h-screen text-dark-text bg-secondary pt-18 p-4'>
        Product not found.
      </div>
    );
  }

  return (
    <div className='min-h-screen  text-dark-text bg-secondary pt-18'>
      <ProductImageGallery images={product.images} />
      <div className='p-4'>
        <div className='flex justify-between items-start text-3xl font-bold'>
          <h1 className=''>{product.name}</h1>
          <p className=''>${product.price}</p>
        </div>
        <p className='text-lg mt-2'>{product.description}</p>
      </div>
      <div className='flex justify-center mt-2'>
        <Link
          href='#'
          className='relative inline-flex items-center justify-center cursor-pointer px-4 py-2 min-w-30 bg-primary text-white text-lg font-medium rounded-[100vw] shadow-md hover:bg-tertiary z-2 shining'
        >
          Fiyat Al
        </Link>
      </div>
      <Cards />
    </div>
  );
}
