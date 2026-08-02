import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Paginakop } from "@/components/catalogus/paginakop";
import { Registratieformulier } from "@/components/account/registratieformulier";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Account aanmaken",
  robots: { index: false, follow: true },
};

export default async function RegistrerenPagina() {
  const sessie = await auth();
  if (sessie?.user) redirect("/account");

  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Mijn account", href: "/account" }, { label: "Account aanmaken" }]}
        titel="Account aanmaken"
        tekst="Bewaar je adres, bekijk je bestelgeschiedenis en vind je verlanglijst terug op elk apparaat."
      />

      <section className="container-ukm py-10 lg:py-14">
        <div className="mx-auto max-w-sm">
          <Registratieformulier />
          <p className="mt-6 text-center text-sm text-inkt-zacht">
            Heb je al een account?{" "}
            <Link href="/account/inloggen" className="font-medium text-salie-700 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
