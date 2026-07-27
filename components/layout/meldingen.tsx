"use client";

import { Toaster } from "sonner";

/** Meldingen in de huisstijl, bijvoorbeeld na het toevoegen aan de winkelwagen. */
export function Meldingen() {
  return (
    <Toaster
      position="bottom-right"
      offset={20}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-2xl !border !border-border/70 !bg-white !text-inkt !shadow-zwevend !font-sans",
          title: "!font-display !font-semibold !text-sm",
          description: "!text-inkt-zacht !text-xs",
          actionButton: "!rounded-full !bg-salie-700 !text-white !text-xs !font-medium",
        },
      }}
    />
  );
}
