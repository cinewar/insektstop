import type {Prisma, Product} from '../../generated/prisma/client';

/**
  * Defines the ProductRecord type.
  * Usage: Use ProductRecord to type related values and keep data contracts consistent.
  */
export type ProductRecord = Product;
/**
  * Defines the ProductImageRecord type.
  * Usage: Use ProductImageRecord to type related values and keep data contracts consistent.
  */
export type ProductImageRecord = Product['images'][number];

/**
  * Defines the OrderProductWithProducts type.
  * Usage: Use OrderProductWithProducts to type related values and keep data contracts consistent.
  */
export type OrderProductWithProducts = Prisma.OrderProductGetPayload<{
  include: {
    products: {
      include: {
        product: true;
      };
    };
  };
}>;

/**
  * Defines the OrderWithProducts type.
  * Usage: Use OrderWithProducts to type related values and keep data contracts consistent.
  */
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
