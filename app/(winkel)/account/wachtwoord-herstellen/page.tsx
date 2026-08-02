import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { Paginakop } from "@/components/catalogus/paginakop";
import { NieuwWachtwoordFormulier } from "@/components/account/nieuw-wachtwoord-formulier";

export const metadata: Metadata = {
  title: "Nieuw wachtwoord instellen",
  robots: { index: false, follow: true },
};

export default async function WachtwoordHerstellenPagina({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Mijn account", href: "/account" }, { label: "Nieuw wachtwoord" }]}
        titel="Nieuw wachtwoord instellen"
      />

      <section className="container-ukm py-10 lg:py-14">
        <div className="mx-auto max-w-sm">
          {token ? (
            <NieuwWachtwoordFormulier token={token} />
          ) : (
            <p className="flex items-start gap-2 text-sm text-koraal">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              Deze link mist een geldig token.{" "}
              <Link href="/account/wachtwoord-vergeten" className="font-medium underline">
                Vraag een nieuwe link aan
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    </>
  );
}
