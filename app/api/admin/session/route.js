import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/request-auth";

export async function GET(request) {
  const session = requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  return NextResponse.json({
    ok: true,
    csrfToken: session.csrf,
    user: { username: session.username, role: session.role }
  });
}
