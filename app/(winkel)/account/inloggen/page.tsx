import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Paginakop } from "@/components/catalogus/paginakop";
import { Inlogformulier } from "@/components/account/inlogformulier";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Inloggen",
  robots: { index: false, follow: true },
};

export default async function InloggenPagina() {
  const sessie = await auth();
  if (sessie?.user) redirect("/account");

  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Mijn account", href: "/account" }, { label: "Inloggen" }]}
        titel="Inloggen"
        tekst="Log in om je bestellingen, adressen en verlanglijst te bekijken."
      />

      <section className="container-ukm py-10 lg:py-14">
        <div className="mx-auto max-w-sm">
          <Inlogformulier />
          <p className="mt-6 text-center text-sm text-inkt-zacht">
            Nog geen account?{" "}
            <Link href="/account/registreren" className="font-medium text-salie-700 hover:underline">
              Account aanmaken
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
