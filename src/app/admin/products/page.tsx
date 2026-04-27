import {prisma} from '@/lib/prisma';
import {AdminProductContent} from './components/ProductsContent';

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany();
  return (
    <>
      <AdminProductContent products={products} />
    </>
  );
}
