import {orderMessageEventBus} from '@/lib/message-events';

export const runtime = 'nodejs';

function toSseBlock(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(
  request: Request,
  context: {params: Promise<{id: string}>},
) {
  const {id: orderId} = await context.params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode('retry: 3000\n\n'));

      const unsubscribe = orderMessageEventBus.subscribe(orderId, (event) => {
        const data =
          event.type === 'message-created' ? event.message : event.messageIds;
        controller.enqueue(encoder.encode(toSseBlock(event.type, data)));
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': keep-alive\n\n'));
      }, 25000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
