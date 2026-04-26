import {NextRequest} from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // Send a single SSE event
      controller.enqueue(
        new TextEncoder().encode(
          'event: message\ndata: {"text":"Hello from Edge!"}\n\n',
        ),
      );
      // Close the stream after sending
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
