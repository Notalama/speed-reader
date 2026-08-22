import path from "node:path";
import { fileURLToPath } from "node:url";
import { federation } from "@module-federation/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const port = 3002;
const origin = process.env.VITE_PUBLIC_ORIGIN ?? `http://localhost:${port}`;

export default defineConfig({
  plugins: [
    federation({
      name: "speed_reader",
      filename: "remoteEntry.js",
      manifest: true,
      dts: false,
      exposes: {
        "./SpeedReader": "./src/speed-reader.tsx",
      },
      shared: {
        react: { singleton: true, requiredVersion: "19.2.4" },
        "react-dom": { singleton: true, requiredVersion: "19.2.4" },
      },
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
  server: {
    port,
    origin,
    cors: true,
    strictPort: true,
  },
  preview: {
    port,
    cors: true,
    strictPort: true,
  },
  base: `${origin}/`,
  build: {
    target: "esnext",
    cssCodeSplit: false,
    modulePreload: false,
  },
});
