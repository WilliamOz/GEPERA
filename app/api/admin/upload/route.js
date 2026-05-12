import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { randomToken } from "@/lib/security";
import { requireAdmin, requireCsrf } from "@/lib/request-auth";

const MIME_EXT = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf"
};

export async function POST(request) {
  const session = requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!requireCsrf(request, session)) return NextResponse.json({ error: "CSRF inválido." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const match = String(body?.dataUrl || "").match(/^data:([^;]+);base64,(.+)$/);
  if (!match || !MIME_EXT[match[1]]) return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });

  const ext = MIME_EXT[match[1]];
  const safeName = String(body.fileName || "arquivo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const fileName = `${Date.now()}-${safeName || "arquivo"}-${randomToken(4)}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, fileName), Buffer.from(match[2], "base64"));

  return NextResponse.json({ url: `/uploads/${fileName}` });
}
