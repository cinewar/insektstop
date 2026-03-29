import type {Prisma, Product} from '../../generated/prisma/client';

export type ProductRecord = Product;
export type ProductImageRecord = Product['images'][number];

export type OrderProductWithProducts = Prisma.OrderProductGetPayload<{
  include: {
    products: {
      include: {
        product: true;
      };
    };
  };
}>;

export type OrderWithProducts = Prisma.OrderGetPayload<{
  include: {
    orderItems: {
      include: {
        products: {
          include: {
            product: true;
          };
        };
      };
    };
  };
}>;
