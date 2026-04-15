import {prisma} from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: {params: Promise<{id: string}>},
) {
  const {id: orderId} = await context.params;

  if (!orderId) {
    return Response.json(
      {ok: false, message: 'Order id is required'},
      {status: 400},
    );
  }

  const messages = await prisma.message.findMany({
    where: {
      orderRefId: orderId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return Response.json({ok: true, data: messages});
}
