import type { Metadata } from "next";

import { BeheerShell } from "@/components/beheer/beheer-shell";

export const metadata: Metadata = {
  title: { default: "Beheer", template: "%s | Beheer UKM.sr" },
  description: "Beheerpaneel van UKM.sr met omzet, bestellingen, voorraad en klanten.",
  robots: { index: false, follow: false },
};

export default function BeheerLayout({ children }: { children: React.ReactNode }) {
  return <BeheerShell>{children}</BeheerShell>;
}
