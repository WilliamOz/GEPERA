import { sessionSecret, verifySignedPayload } from "./security";

export function requireAdmin(request) {
  const token = readCookie(request, "gepera_session");
  const session = verifySignedPayload(token, sessionSecret());
  if (!session || session.role !== "admin") return null;
  return session;
}

export function requireCsrf(request, session) {
  return request.headers.get("x-csrf-token") === session.csrf;
}

function readCookie(request, name) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.split(";").map((item) => item.trim()).reduce((found, item) => {
    if (found) return found;
    const [key, ...rest] = item.split("=");
    return key === name ? rest.join("=") : "";
  }, "");
}
