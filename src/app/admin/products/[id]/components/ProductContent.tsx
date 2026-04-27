'use client';

import {ProductImageGallery} from '@/app/components/ProductImageGallery';
import {Product} from '../../../../../../generated/prisma';
import {GlassyButton} from '@/app/components/GlassyButton';
import {CLOSESVG, EDITSVG, LOGOUTSVG} from '@/app/utils/svg';

interface AdminProductContentProps {
  product: Product;
}

export function AdminProductContent({product}: AdminProductContentProps) {
  return (
    <div className='text-dark-text bg-secondary mt-1'>
      <ProductImageGallery images={product.images} />
      <div
        className='bg-tertiary max-w-fit ml-2 text-white font-semibold px-2
                text-lg rounded-full -translate-y-10'
      >
        £{product.price}
      </div>
      <div className='p-2 -mt-6'>
        <p className='text-base leading-tight'>{product.description}</p>
      </div>
      <div className='flex gap-2 bg-gray p-1 rounded-full max-w-fit float-end'>
        <GlassyButton
          icon={CLOSESVG}
          label='Sil'
          iconSize={32}
          // onClick={() => setOpenModal(true)}
          className='gap-3 [&>svg]:stroke-red'
        />
        <GlassyButton
          icon={EDITSVG}
          label='Düzenle'
          iconSize={40}
          // onClick={handleLogout}
          className='gap-3 '
        />
      </div>
    </div>
  );
}
