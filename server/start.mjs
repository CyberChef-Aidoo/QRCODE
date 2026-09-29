import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { createAdminMiddleware } from "./createApi.js";

const root = path.resolve("dist");
const middleware = createAdminMiddleware();
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8",
};

function fileFor(urlPath) {
  const requested = decodeURIComponent(urlPath.split("?")[0]);
  const relative = requested === "/" ? "index.html" : requested.replace(/^\/+/, "");
  const full = path.resolve(root, relative);
  if (full !== root && !full.startsWith(`${root}${path.sep}`)) {
    return null;
  }
  return full;
}

function serveStatic(req, res) {
  const full = fileFor(req.url || "/");
  if (!full || !existsSync(full) || !statSync(full).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found.");
    return;
  }
  res.writeHead(200, {
    "Content-Type": types[path.extname(full)] || "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
  });
  createReadStream(full).pipe(res);
}

const port = Number(process.env.PORT || 4173);
createServer((req, res) => {
  middleware(req, res, () => serveStatic(req, res));
}).listen(port, () => {
  console.log(`Audience server at http://localhost:${port}`);
});
