import { NextResponse } from "next/server";
import { getSiteContent, saveSiteContent } from "@/lib/db";
import { requireAdmin, requireCsrf } from "@/lib/request-auth";

export async function GET(request) {
  const session = requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  return NextResponse.json(getSiteContent());
}

export async function POST(request) {
  const session = requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!requireCsrf(request, session)) return NextResponse.json({ error: "CSRF inválido." }, { status: 403 });

  const data = await request.json().catch(() => null);
  if (!data || !data.settings || !data.pages) {
    return NextResponse.json({ error: "Formato inválido." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for") || "local";
  saveSiteContent(data, session.username, ip);
  return NextResponse.json({ ok: true });
}
