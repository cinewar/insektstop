import 'dotenv/config';
import {PrismaClient} from '../generated/prisma/client';
import productsJson from '../src/lib/products.json';

const prisma = new PrismaClient();

async function main() {
  const products = productsJson.map((product) => ({
    productId: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    images: product.images.map((image) => ({
      id: image.id,
      img: image.img,
    })),
  }));

  for (const product of products) {
    await prisma.product.upsert({
      where: {productId: product.productId},
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
      },
      create: product,
    });
  }

  await prisma.orderProduct.deleteMany();
  await prisma.order.deleteMany({where: {orderId: 1001}});

  const selectedProducts = await prisma.product.findMany({
    where: {productId: {in: [1, 2]}},
    orderBy: {productId: 'asc'},
  });

  if (selectedProducts.length < 2) {
    throw new Error('Expected seed products were not found.');
  }

  const order = await prisma.order.create({
    data: {
      orderId: 1001,
      orderName: 'Sample Order',
      totalPrice: selectedProducts[0].price + selectedProducts[1].price,
      createrName: 'Sample Customer',
      createrEmail: 'customer@example.com',
      createrPhone: '+90 555 123 45 67',
    },
  });

  const orderItemsData = selectedProducts.map((product, index) => ({
    orderRefId: order.id,
    productRefId: product.id,
    length: 100 + index * 20,
    width: 50 + index * 10,
    price: product.price,
    images: product.images.slice(0, 2).map((image) => ({
      id: image.id,
      img: image.img,
    })),
  }));

  await prisma.orderProduct.createMany({
    data: orderItemsData,
  });

  console.log(
    `Seed completed: ${products.length} products, 1 order, ${orderItemsData.length} order items.`,
  );
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
