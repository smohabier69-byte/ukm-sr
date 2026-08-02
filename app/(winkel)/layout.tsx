import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Aankondigingsbalk } from "@/components/layout/aankondigingsbalk";
import { VerlanglijstSync } from "@/components/winkel/verlanglijst-sync";

/** Omlijsting van de winkel: aankondigingsbalk, navigatie en voettekst. */
export default function WinkelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VerlanglijstSync />
      <Aankondigingsbalk />
      <SiteHeader />
      <main id="hoofdinhoud">{children}</main>
      <SiteFooter />
    </>
  );
}
