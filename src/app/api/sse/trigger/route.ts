import {NextRequest} from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  // This endpoint can be extended to trigger notifications, logging, etc.
  // For now, it just returns success.
  return new Response(JSON.stringify({ok: true}), {
    status: 200,
    headers: {'Content-Type': 'application/json'},
  });
}
