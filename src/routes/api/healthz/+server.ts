import { HttpStatus } from '$lib/types';

export async function GET() {
  return new Response('OK', { status: HttpStatus.OK });
}
