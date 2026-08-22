import path from "node:path";
import { fileURLToPath } from "node:url";
import { federation } from "@module-federation/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const port = 3002;
const origin = process.env.VITE_PUBLIC_ORIGIN ?? `http://localhost:${port}`;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "*",
};
const reactShared = {
  singleton: true,
  requiredVersion: false,
  strictVersion: false,
  import: false as const,
};

export default defineConfig({
  plugins: [
    federation({
      name: "speed_reader",
      filename: "remoteEntry.js",
      manifest: true,
      dts: false,
      shareStrategy: "loaded-first",
      exposes: {
        "./SpeedReader": "./src/speed-reader.tsx",
      },
      shared: {
        react: reactShared,
        "react-dom": reactShared,
        "react-dom/client": reactShared,
        "react/jsx-runtime": reactShared,
        "react/jsx-dev-runtime": reactShared,
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
    hmr: false,
    headers: corsHeaders,
  },
  preview: {
    port,
    cors: true,
    strictPort: true,
    headers: corsHeaders,
  },
  base: `${origin}/`,
  build: {
    target: "esnext",
    cssCodeSplit: false,
    modulePreload: false,
  },
});
