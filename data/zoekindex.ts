import { categorielabels } from "@/lib/catalogus";
import { normaliseerTekst } from "@/lib/zoeken";
import { producten } from "./producten";

export interface Zoekindexitem {
  slug: string;
  naam: string;
  categorie: string;
  prijs: number;
  afbeelding: string;
  /** Vooraf genormaliseerd, zodat de browser dat per toetsaanslag niet hoeft te doen. */
  zoektekst: string;
}

/**
 * Compacte index voor de suggesties in de navigatiebalk.
 *
 * De volledige productlijst met alle beschrijvingen meesturen naar elke pagina
 * zou de bundel onnodig opblazen. Deze index bevat alleen wat een suggestie
 * nodig heeft: naam, prijs, een foto en de doorzoekbare tekst.
 */
export const zoekindex: Zoekindexitem[] = producten.map((product) => ({
  slug: product.slug,
  naam: product.naam,
  categorie: categorielabels[product.categorie] ?? product.categorie,
  prijs: product.prijs,
  afbeelding: product.afbeeldingen[0],
  zoektekst: normaliseerTekst(
    [
      product.naam,
      product.catalogusnaam,
      product.subcategorie,
      product.categorie,
      product.merk,
      product.kleurfamilie ?? "",
      product.vorm ?? "",
      product.techniek ?? "",
    ].join(" "),
  ),
}));
