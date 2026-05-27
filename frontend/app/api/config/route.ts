export async function GET() {
  // Reading NEXT_PUBLIC_SOCKET_URL server-side gets the real runtime value (not build-time embedded)
  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.BACKEND_URL ||
    '';
  return Response.json({ socketUrl });
}
