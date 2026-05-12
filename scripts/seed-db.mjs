import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const dbPath = path.join(ROOT, "data", "gepera.db");
const dataPath = path.join(ROOT, "data", "site-data.json");
const username = process.env.GEPERA_ADMIN_USER || "admin";
const password = process.env.GEPERA_ADMIN_PASS || "gepera2026";

function hashPassword(value) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(value, salt, 210000, 32, "sha256").toString("hex");
  return `pbkdf2$210000$${salt}$${hash}`;
}

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS site_content (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    detail TEXT,
    ip TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const user = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
if (!user) {
  db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')").run(
    username,
    hashPassword(password)
  );
}

const content = fs.existsSync(dataPath)
  ? fs.readFileSync(dataPath, "utf8")
  : JSON.stringify({ version: 1, settings: {}, pages: {} }, null, 2);

db.prepare(`
  INSERT INTO site_content (id, data) VALUES ('main', ?)
  ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
`).run(content);

console.log(`Banco pronto em ${dbPath}`);
