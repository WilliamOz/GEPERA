import { NextResponse } from "next/server";
import { audit, findUser } from "@/lib/db";
import { randomToken, sessionSecret, signPayload, verifyPassword } from "@/lib/security";

const attempts = new Map();

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  const blocked = tooManyAttempts(ip);
  if (blocked) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  const user = username ? findUser(username) : null;

  if (!user || !verifyPassword(password, user.password_hash)) {
    registerAttempt(ip);
    audit(username || "anonymous", "auth.failed", "Falha de login", ip);
    return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
  }

  attempts.delete(ip);
  const csrf = randomToken(24);
  const token = signPayload(
    { sub: user.id, username: user.username, role: user.role, csrf, exp: Date.now() + 8 * 60 * 60 * 1000 },
    sessionSecret()
  );

  audit(user.username, "auth.login", "Login administrativo", ip);
  const response = NextResponse.json({ ok: true, csrfToken: csrf, user: { username: user.username, role: user.role } });
  response.cookies.set("gepera_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 60 * 60
  });
  return response;
}

function tooManyAttempts(ip) {
  const record = attempts.get(ip);
  if (!record) return false;
  return record.count >= 8 && Date.now() - record.first < 10 * 60 * 1000;
}

function registerAttempt(ip) {
  const current = attempts.get(ip) || { count: 0, first: Date.now() };
  attempts.set(ip, { count: current.count + 1, first: current.first });
}
