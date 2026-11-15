import { Buffer } from "node:buffer";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const apiPrefix = "/__local_portfolio";
const sessionCookie = "portfolio_local_admin";
const sessionLifetimeMs = 8 * 60 * 60 * 1000;
const attemptLifetimeMs = 15 * 60 * 1000;
const maxAttempts = 5;
const maxRequestBytes = 7 * 1024 * 1024;
const allowedImages = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const pinMatches = (submitted, configured) => {
  if (typeof submitted !== "string" || !configured) return false;
  const submittedHash = createHash("sha256").update(submitted).digest();
  const configuredHash = createHash("sha256").update(configured).digest();
  return timingSafeEqual(submittedHash, configuredHash);
};

const readJsonBody = (request) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxRequestBytes) {
        reject(Object.assign(new Error("Request too large."), { status: 413 }));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(Object.assign(new Error("Invalid JSON."), { status: 400 }));
      }
    });

    request.on("error", reject);
  });

const sendJson = (response, status, value, headers = {}) => {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  response.end(JSON.stringify(value));
};

const cookieValue = (request) => {
  const cookie = request.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookie}=`));
  return cookie?.slice(sessionCookie.length + 1);
};

export const localAdminPlugin = (adminPin) => {
  const sessions = new Map();
  const attempts = new Map();

  return {
    name: "portfolio-local-file-admin",
    apply: "serve",
    configureServer(server) {
      const root = server.config.root;
      const contentPath = path.join(root, "portfolio-data", "content.json");
      const uploadsPath = path.join(root, "public", "uploads");

      server.middlewares.use(async (request, response, next) => {
        const requestUrl = new URL(request.url || "/", "http://localhost");
        if (!requestUrl.pathname.startsWith(`${apiPrefix}/`)) {
          next();
          return;
        }

        const route = requestUrl.pathname.slice(apiPrefix.length);
        const method = request.method || "GET";

        try {
          if (method === "POST" && route === "/login") {
            const ip = request.socket.remoteAddress || "local";
            const now = Date.now();
            const current = attempts.get(ip);
            if (current && now - current.startedAt < attemptLifetimeMs && current.count >= maxAttempts) {
              sendJson(response, 429, { error: "Too many attempts. Wait 15 minutes and try again." });
              return;
            }

            const body = await readJsonBody(request);
            if (!pinMatches(body.pin, adminPin)) {
              const nextAttempt =
                current && now - current.startedAt < attemptLifetimeMs
                  ? { count: current.count + 1, startedAt: current.startedAt }
                  : { count: 1, startedAt: now };
              attempts.set(ip, nextAttempt);
              sendJson(response, adminPin ? 401 : 503, {
                error: adminPin ? "That local development PIN is incorrect." : "Set PORTFOLIO_ADMIN_PIN in .env.local.",
              });
              return;
            }

            attempts.delete(ip);
            const session = randomUUID();
            sessions.set(session, now + sessionLifetimeMs);
            sendJson(response, 200, { authenticated: true }, {
              "Set-Cookie": `${sessionCookie}=${session}; HttpOnly; SameSite=Strict; Path=${apiPrefix}; Max-Age=${sessionLifetimeMs / 1000}`,
            });
            return;
          }

          if (method === "GET" && route === "/session") {
            const session = cookieValue(request);
            const expiresAt = session && sessions.get(session);
            if (!expiresAt || expiresAt <= Date.now()) {
              if (session) sessions.delete(session);
              sendJson(response, 200, { authenticated: false });
              return;
            }
            sendJson(response, 200, { authenticated: true });
            return;
          }

          if (method === "POST" && route === "/logout") {
            const session = cookieValue(request);
            if (session) sessions.delete(session);
            sendJson(response, 200, { authenticated: false }, {
              "Set-Cookie": `${sessionCookie}=; HttpOnly; SameSite=Strict; Path=${apiPrefix}; Max-Age=0`,
            });
            return;
          }

          if (method === "GET" && route === "/content") {
            try {
              const content = JSON.parse(await readFile(contentPath, "utf8"));
              sendJson(response, 200, content);
            } catch (error) {
              if (error.code !== "ENOENT") throw error;
              sendJson(response, 200, {});
            }
            return;
          }

          const session = cookieValue(request);
          const expiresAt = session && sessions.get(session);
          if (!expiresAt || expiresAt <= Date.now()) {
            if (session) sessions.delete(session);
            sendJson(response, 401, { error: "Local admin session expired." });
            return;
          }

          if (method === "PUT" && route === "/content") {
            const content = await readJsonBody(request);
            if (!content || typeof content !== "object" || Array.isArray(content)) {
              sendJson(response, 400, { error: "Portfolio content must be an object." });
              return;
            }
            await mkdir(path.dirname(contentPath), { recursive: true });
            await writeFile(contentPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
            sendJson(response, 200, { saved: true });
            return;
          }

          if (method === "POST" && route === "/media") {
            const body = await readJsonBody(request);
            const extension = allowedImages[body.type];
            if (!extension || typeof body.data !== "string") {
              sendJson(response, 400, { error: "Choose a JPG, PNG, WebP, or GIF image." });
              return;
            }

            const image = Buffer.from(body.data, "base64");
            if (image.length === 0 || image.length > 5 * 1024 * 1024) {
              sendJson(response, 413, { error: "Images must be smaller than 5 MB." });
              return;
            }

            await mkdir(uploadsPath, { recursive: true });
            const filename = `${randomUUID()}.${extension}`;
            await writeFile(path.join(uploadsPath, filename), image, { flag: "wx" });
            sendJson(response, 200, { url: `/uploads/${filename}` });
            return;
          }

          sendJson(response, 404, { error: "Local admin endpoint not found." });
        } catch (error) {
          if (!response.headersSent) {
            sendJson(response, error.status || 500, {
              error: error.status ? error.message : "Local portfolio operation failed.",
            });
          } else {
            response.end();
          }
          if (!error.status) {
            server.config.logger.error(error);
          }
        }
      });
    },
  };
};
