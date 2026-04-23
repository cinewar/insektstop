import 'dotenv/config';
import {CreatorType, PrismaClient} from '../generated/prisma/client';

const prisma = new PrismaClient();

type MessageTemplate = {
  content: string;
  creator: CreatorType;
  read: boolean;
};

function buildDefaultMessages(orderName: string): MessageTemplate[] {
  return [
    {
      content: `Order ${orderName} has been created and is now in progress.`,
      creator: CreatorType.Customer,
      read: true,
    },
    {
      content: `Order ${orderName} is being reviewed by our team.`,
      creator: CreatorType.Admin,
      read: false,
    },
  ];
}

async function main() {
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      orderName: true,
      messages: {
        select: {id: true},
        take: 1,
      },
    },
  });

  let seededOrders = 0;
  let seededMessages = 0;

  for (const order of orders) {
    if (order.messages.length > 0) {
      continue;
    }

    const templates = buildDefaultMessages(order.orderName);

    for (const template of templates) {
      await prisma.message.create({
        data: {
          orderRefId: order.id,
          content: template.content,
          creator: template.creator,
          read: template.read,
        },
      });
      seededMessages += 1;
    }

    seededOrders += 1;
  }
}

main()
  .catch((error) => {
    console.error('Message backfill failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
