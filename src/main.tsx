import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SpeedReader } from "./speed-reader";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="mx-auto flex h-svh w-full max-w-4xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
        Speed Reader
      </h1>
      <SpeedReader />
    </div>
  </StrictMode>,
);
