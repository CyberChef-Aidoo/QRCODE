import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

function adminApiPlugin() {
  return {
    name: "audience-admin-api",
    async configureServer(server) {
      const { createAdminMiddleware } = await import("./server/createApi.js");
      server.middlewares.use(createAdminMiddleware());
    },
    async configurePreviewServer(server) {
      const { createAdminMiddleware } = await import("./server/createApi.js");
      server.middlewares.use(createAdminMiddleware());
    },
  };
}

export default defineConfig({
  plugins: [react(), adminApiPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        dashboard: resolve(root, "dashboard.html"),
      },
    },
  },
});
