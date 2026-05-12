import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { hashPassword } from "./security";

const ROOT = process.cwd();
const DB_PATH = path.join(ROOT, "data", "gepera.db");
const DATA_JSON = path.join(ROOT, "data", "site-data.json");

let db;
let sqliteStatus;
const require = createRequire(import.meta.url);

function loadDatabaseSync() {
  if (sqliteStatus !== undefined) return sqliteStatus;

  try {
    sqliteStatus = require("node:sqlite").DatabaseSync;
  } catch (error) {
    console.warn("[GEPERA] SQLite indisponível neste ambiente; usando conteúdo JSON.", error?.message || error);
    sqliteStatus = null;
  }

  return sqliteStatus;
}

function readJsonContent() {
  if (!fs.existsSync(DATA_JSON)) return { version: 1, settings: {}, pages: {} };
  return JSON.parse(fs.readFileSync(DATA_JSON, "utf8"));
}

export function getDb() {
  const DatabaseSync = loadDatabaseSync();
  if (!DatabaseSync) throw new Error("SQLite indisponível neste ambiente.");

  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new DatabaseSync(DB_PATH);
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA foreign_keys = ON");
    ensureSchema(db);
  }
  return db;
}

function ensureSchema(database) {
  database.exec(`
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

  seedAdmin(database);
  seedContent(database);
}

function seedAdmin(database) {
  const count = database.prepare("SELECT COUNT(*) AS total FROM users").get().total;
  if (count > 0) return;

  const username = process.env.GEPERA_ADMIN_USER || "admin";
  const password = process.env.GEPERA_ADMIN_PASS || "gepera2026";
  database.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')").run(
    username,
    hashPassword(password)
  );
}

function seedContent(database) {
  const row = database.prepare("SELECT id FROM site_content WHERE id = 'main'").get();
  if (row) return;

  const data = readJsonContent();

  database.prepare("INSERT INTO site_content (id, data) VALUES ('main', ?)").run(JSON.stringify(data));
}

export function getSiteContent() {
  try {
    const row = getDb().prepare("SELECT data FROM site_content WHERE id = 'main'").get();
    return row ? JSON.parse(row.data) : readJsonContent();
  } catch (error) {
    return readJsonContent();
  }
}

export function saveSiteContent(data, actor = "admin", ip = "") {
  const payload = JSON.stringify(data, null, 2);
  const database = getDb();
  database
    .prepare("UPDATE site_content SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 'main'")
    .run(payload);
  database
    .prepare("INSERT INTO audit_logs (actor, action, detail, ip) VALUES (?, 'content.update', ?, ?)")
    .run(actor, "Atualização de conteúdo pelo painel Next", ip);
  fs.mkdirSync(path.dirname(DATA_JSON), { recursive: true });
  fs.writeFileSync(DATA_JSON, payload, "utf8");
}

export function findUser(username) {
  try {
    return getDb().prepare("SELECT * FROM users WHERE username = ?").get(username);
  } catch (error) {
    const fallbackUser = process.env.GEPERA_ADMIN_USER;
    const fallbackPass = process.env.GEPERA_ADMIN_PASS;
    if (!fallbackUser || !fallbackPass || username !== fallbackUser) return null;
    return { id: 1, username: fallbackUser, role: "admin", password_hash: hashPassword(fallbackPass) };
  }
}

export function audit(actor, action, detail = "", ip = "") {
  try {
    getDb().prepare("INSERT INTO audit_logs (actor, action, detail, ip) VALUES (?, ?, ?, ?)").run(
      actor,
      action,
      detail,
      ip
    );
  } catch (error) {
    console.warn("[GEPERA] Audit log não persistido:", action, detail);
  }
}
