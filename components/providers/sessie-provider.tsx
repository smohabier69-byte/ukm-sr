"use client";

import { SessionProvider } from "next-auth/react";

export function SessieProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
