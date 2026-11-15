"use client";

import { usePathname } from "next/navigation";

import { WhatsAppIcoon } from "@/components/merk/sociale-iconen";
import { siteUrl, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Zwevende WhatsApp-knop rechtsonder op elke pagina. Opent een gesprek met de
 * winkel; op een productpagina staat de link naar dat product al in het
 * bericht, zodat UKM meteen ziet waar de vraag over gaat.
 */
export function WhatsAppKnop() {
  const pad = usePathname();
  const opProductpagina = pad?.startsWith("/producten/") ?? false;
  const bericht = opProductpagina
    ? `Hallo UKM.sr, ik heb een vraag over dit product: ${siteUrl}${pad}`
    : "Hallo UKM.sr, ik heb een vraag.";

  return (
    <a
      href={whatsappLink(bericht)}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Stuur ons een bericht via WhatsApp"
      className={cn(
        "group fixed right-5 z-40 flex items-center gap-2.5 rounded-full bg-[#25d366] p-3.5 text-white shadow-zwevend transition-transform duration-300 ease-[var(--ease-uit)] hover:scale-105 focus-visible:outline-offset-4 sm:right-6 lg:pr-5",
        // Op productpagina's zit onderaan de vaste koopbalk; de knop blijft daarboven.
        opProductpagina ? "bottom-24" : "bottom-5 sm:bottom-6",
      )}
    >
      <WhatsAppIcoon className="size-7" />
      <span className="hidden text-sm font-semibold lg:inline">Vragen? App ons</span>
    </a>
  );
}
