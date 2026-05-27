export async function GET() {
  return Response.json({
    socketUrl: process.env.BACKEND_URL || '',
  });
}
