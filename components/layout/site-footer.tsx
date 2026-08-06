import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";

import { UkmLogo } from "@/components/merk/ukm-logo";
import { FacebookIcoon, InstagramIcoon } from "@/components/merk/sociale-iconen";
import { Separator } from "@/components/ui/separator";
import { bedrijf, footernavigatie } from "@/lib/site";

const kolommen = [
  { titel: "Winkelen", items: footernavigatie.winkelen },
  { titel: "Klantenservice", items: footernavigatie.klantenservice },
  { titel: "Bedrijf", items: footernavigatie.bedrijf },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-salie-50/60">
      <div className="container-ukm py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-8">
          <div className="max-w-sm">
            <UkmLogo metTagline />
            <p className="mt-5 text-sm leading-relaxed text-inkt-zacht">{bedrijf.beschrijving}</p>

            <ul className="mt-7 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-salie-600" />
                <span>
                  {bedrijf.adres.straat}
                  <br />
                  {bedrijf.adres.stad}, {bedrijf.adres.land}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-salie-600" />
                <a href={`tel:${bedrijf.telefoonPlat}`} className="transition-colors hover:text-salie-700">
                  {bedrijf.telefoon}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-salie-600" />
                <span>
                  {bedrijf.openingstijden.map((rij) => (
                    <span key={rij.dagen} className="block">
                      {rij.dagen}: {rij.tijden}
                    </span>
                  ))}
                </span>
              </li>
            </ul>

            <div className="mt-7 flex gap-2">
              <a
                href={bedrijf.instagramUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="UKM.sr op Instagram"
                className="rounded-full border border-border bg-white p-2.5 text-inkt-zacht transition-colors hover:border-salie-400 hover:text-salie-700"
              >
                <InstagramIcoon className="size-4" />
              </a>
              <a
                href={bedrijf.facebookUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="UKM.sr op Facebook"
                className="rounded-full border border-border bg-white p-2.5 text-inkt-zacht transition-colors hover:border-salie-400 hover:text-salie-700"
              >
                <FacebookIcoon className="size-4" />
              </a>
            </div>
          </div>

          {kolommen.map((kolom) => (
            <nav key={kolom.titel} aria-label={kolom.titel}>
              <p className="mb-5 font-display text-[0.6875rem] font-semibold tracking-[0.14em] text-inkt-zacht uppercase">
                {kolom.titel}
              </p>
              <ul className="space-y-3">
                {kolom.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-inkt-zacht transition-colors hover:text-salie-700">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col gap-5 text-xs text-inkt-zacht md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {bedrijf.naam}. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
}
