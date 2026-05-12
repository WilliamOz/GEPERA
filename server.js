const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "site-data.json");
const UPLOAD_DIR = path.join(ROOT, "uploads");
const DEFAULT_PORT = Number(process.env.PORT || argPort() || 4173);
const ADMIN_USER = process.env.GEPERA_ADMIN_USER || "admin";
const ADMIN_PASS = process.env.GEPERA_ADMIN_PASS || "gepera2026";
const MAX_JSON = 12 * 1024 * 1024;
const sessions = new Map();

const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".pdf": "application/pdf"
};

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const server = http.createServer(async (request, response) => {
    try {
        const url = new URL(request.url, `http://${request.headers.host}`);

        if (url.pathname.startsWith("/api/")) {
            await handleApi(request, response, url);
            return;
        }

        serveStatic(url.pathname, response);
    } catch (error) {
        console.error(error);
        sendJson(response, 500, { error: "Erro interno do servidor." });
    }
});

listen(DEFAULT_PORT);

function argPort() {
    const index = process.argv.indexOf("--port");
    if (index >= 0) return process.argv[index + 1];
    const positional = process.argv.slice(2).find((arg) => /^\d+$/.test(arg));
    return positional || "";
}

function listen(port) {
    server.once("error", (error) => {
        if (error.code === "EADDRINUSE" && port < DEFAULT_PORT + 20) {
            listen(port + 1);
            return;
        }
        throw error;
    });

    server.listen(port, () => {
        console.log(`GEPERA rodando em http://localhost:${port}`);
        console.log(`Admin: http://localhost:${port}/admin.html`);
    });
}

async function handleApi(request, response, url) {
    if (request.method === "GET" && url.pathname === "/api/content") {
        if (!fs.existsSync(DATA_FILE)) {
            sendJson(response, 404, { error: "Conteúdo salvo ainda não existe." });
            return;
        }
        sendFile(DATA_FILE, response, "application/json; charset=utf-8");
        return;
    }

    if (request.method === "GET" && url.pathname === "/api/session") {
        if (!isAuthenticated(request)) {
            sendJson(response, 401, { error: "Não autenticado." });
            return;
        }
        sendJson(response, 200, { ok: true });
        return;
    }

    if (request.method === "POST" && url.pathname === "/api/login") {
        const body = await readJson(request);
        if (body.user !== ADMIN_USER || body.password !== ADMIN_PASS) {
            sendJson(response, 401, { error: "Credenciais inválidas." });
            return;
        }

        const token = crypto.randomBytes(32).toString("hex");
        sessions.set(token, Date.now() + 8 * 60 * 60 * 1000);
        response.setHeader("Set-Cookie", `gepera_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`);
        sendJson(response, 200, { ok: true });
        return;
    }

    if (request.method === "POST" && url.pathname === "/api/logout") {
        const token = cookieValue(request, "gepera_session");
        if (token) sessions.delete(token);
        response.setHeader("Set-Cookie", "gepera_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
        sendJson(response, 200, { ok: true });
        return;
    }

    if (request.method === "POST" && url.pathname === "/api/content") {
        if (!isAuthenticated(request)) {
            sendJson(response, 401, { error: "Não autenticado." });
            return;
        }

        const body = await readJson(request);
        if (!body || !body.settings || !body.pages) {
            sendJson(response, 400, { error: "Formato de conteúdo inválido." });
            return;
        }

        fs.writeFileSync(DATA_FILE, JSON.stringify(body, null, 2), "utf8");
        sendJson(response, 200, { ok: true });
        return;
    }

    if (request.method === "POST" && url.pathname === "/api/upload") {
        if (!isAuthenticated(request)) {
            sendJson(response, 401, { error: "Não autenticado." });
            return;
        }

        const body = await readJson(request);
        const saved = saveUpload(body);
        sendJson(response, 200, saved);
        return;
    }

    sendJson(response, 404, { error: "Rota não encontrada." });
}

function serveStatic(pathname, response) {
    const cleanPath = decodeURIComponent(pathname.split("?")[0]);
    const requested = cleanPath === "/" ? "/index.html" : cleanPath;
    const absolute = path.resolve(ROOT, `.${requested}`);

    if (!absolute.startsWith(ROOT)) {
        sendJson(response, 403, { error: "Acesso negado." });
        return;
    }

    if (!fs.existsSync(absolute) || fs.statSync(absolute).isDirectory()) {
        const fallback = path.join(ROOT, "index.html");
        sendFile(fallback, response, mimeTypes[".html"]);
        return;
    }

    sendFile(absolute, response, mimeTypes[path.extname(absolute).toLowerCase()] || "application/octet-stream");
}

function sendFile(file, response, type) {
    response.writeHead(200, {
        "Content-Type": type,
        "Cache-Control": "no-store"
    });
    fs.createReadStream(file).pipe(response);
}

function sendJson(response, status, payload) {
    response.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    });
    response.end(JSON.stringify(payload));
}

function readJson(request) {
    return new Promise((resolve, reject) => {
        let raw = "";
        request.on("data", (chunk) => {
            raw += chunk;
            if (raw.length > MAX_JSON) {
                reject(new Error("Payload muito grande."));
                request.destroy();
            }
        });
        request.on("end", () => {
            try {
                resolve(raw ? JSON.parse(raw) : {});
            } catch (error) {
                reject(error);
            }
        });
        request.on("error", reject);
    });
}

function isAuthenticated(request) {
    const token = cookieValue(request, "gepera_session");
    const expires = token ? sessions.get(token) : 0;
    if (!expires || expires < Date.now()) {
        if (token) sessions.delete(token);
        return false;
    }
    return true;
}

function cookieValue(request, name) {
    const cookie = request.headers.cookie || "";
    return cookie.split(";").map((item) => item.trim()).reduce((found, item) => {
        if (found) return found;
        const [key, ...rest] = item.split("=");
        return key === name ? rest.join("=") : "";
    }, "");
}

function saveUpload(body) {
    if (!body || !body.dataUrl || !body.fileName) {
        throw new Error("Upload inválido.");
    }

    const match = String(body.dataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
        throw new Error("Apenas imagens em base64 são aceitas.");
    }

    const mime = match[1];
    const extFromMime = {
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/svg+xml": ".svg"
    }[mime] || path.extname(body.fileName).toLowerCase() || ".png";

    const safeBase = path.basename(body.fileName, path.extname(body.fileName))
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || "imagem";

    const fileName = `${Date.now()}-${safeBase}${extFromMime}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    fs.writeFileSync(filePath, Buffer.from(match[2], "base64"));

    return { url: `uploads/${fileName}` };
}
