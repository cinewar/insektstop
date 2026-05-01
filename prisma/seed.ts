import 'dotenv/config';
import bcrypt from 'bcrypt';
import {PrismaClient} from '../generated/prisma/client';
import productsJson from '../src/lib/products.json';

const prisma = new PrismaClient();
const cloudflareImages = [
  {
    id: 1,
    img: 'https://images.gettogethertr.com/photo-1628952542177-1832b370e58d.webp',
  },
  {
    id: 2,
    img: 'https://images.gettogethertr.com/photo-1628952542512-752dc5d034c2.webp',
  },
  {
    id: 3,
    img: 'https://images.gettogethertr.com/photo-1628952542515-9efd6d280838.webp',
  },
  {
    id: 4,
    img: 'https://images.gettogethertr.com/photo-1657060169906-266c8ca36da5.webp',
  },
  {
    id: 5,
    img: 'https://images.gettogethertr.com/photo-1678807499708-868dc3d14ce9.webp',
  },
  {
    id: 6,
    img: 'https://images.gettogethertr.com/photo-1680003559115-3a357ef2a137.webp',
  },
];

/**
 * Describes behavior for buildProductImages.
 * Usage: Call buildProductImages(...) where this declaration is needed in the current module flow.
 */
function buildProductImages(productIndex: number) {
  const startIndex = productIndex % cloudflareImages.length;
  const rotated = [
    ...cloudflareImages.slice(startIndex),
    ...cloudflareImages.slice(0, startIndex),
  ];

  return rotated.map((image, index) => ({
    id: index + 1,
    img: image.img,
  }));
}

/**
 * Describes behavior for main.
 * Usage: Call main(...) where this declaration is needed in the current module flow.
 */
async function main() {
  // Add user with hashed password
  const password = '159823';
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: {email: 'sevinc65semih@gmail.com'},
    update: {
      name: 'semih',
      password: hashedPassword,
      about: 'Kurucu, sineklik uzmanı.',
      heroImage: '/hero.png',
      heroText: 'Evinizde Rahatça Oturmanın Yegane Yolu',
    },
    create: {
      name: 'semih',
      email: 'sevinc65semih@gmail.com',
      password: hashedPassword,
      about: 'Kurucu, sineklik uzmanı.',
      heroImage: '/hero.png',
      heroText: 'Evinizde Rahatça Oturmanın Yegane Yolu',
    },
  });
  const products = productsJson.map((product, index) => ({
    productId: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    images: buildProductImages(index),
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

  await prisma.orderItemProduct.deleteMany();
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
      createrAddress: 'Sample Neighborhood, Istanbul',
    },
  });

  const orderItemsData = selectedProducts.map((product, index) => ({
    name: `Room${index + 1}`,
    orderRefId: order.id,
    productIds: [product.id],
    length: 100 + index * 20,
    width: 50 + index * 10,
    price: product.price,
    images: product.images.slice(0, 2).map((image) => ({
      id: image.id,
      img: image.img,
    })),
  }));

  orderItemsData.push({
    name: `Room${orderItemsData.length + 1}`,
    orderRefId: order.id,
    productIds: selectedProducts.map((product) => product.id),
    length: 180,
    width: 90,
    price: selectedProducts.reduce((sum, product) => sum + product.price, 0),
    images: selectedProducts.flatMap((product) =>
      product.images.slice(0, 1).map((image) => ({
        id: image.id,
        img: image.img,
      })),
    ),
  });

  for (const item of orderItemsData) {
    const createdItem = await prisma.orderProduct.create({
      data: {
        name: item.name,
        orderRefId: item.orderRefId,
        price: item.price,
      },
    });

    for (const productId of item.productIds) {
      await prisma.orderItemProduct.create({
        data: {
          orderProductRefId: createdItem.id,
          productRefId: productId,
          length: item.length,
          width: item.width,
          images: item.images,
        },
      });
    }
  }

  const calculatedTotalPrice = orderItemsData.reduce(
    (sum, item) => sum + item.price,
    0,
  );

  await prisma.order.update({
    where: {id: order.id},
    data: {totalPrice: calculatedTotalPrice},
  });
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
