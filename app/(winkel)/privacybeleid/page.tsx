import type { Metadata } from "next";
import Link from "next/link";

import { Paginakop } from "@/components/catalogus/paginakop";
import { bedrijf } from "@/lib/site";
import { formatDatumLang } from "@/lib/format";

export const metadata: Metadata = {
  title: "Privacybeleid",
  description: "Welke gegevens UKM.sr verwerkt en waarvoor.",
  alternates: { canonical: "/privacybeleid" },
};

const BIJGEWERKT = "2026-07-27";

export default function PrivacybeleidPagina() {
  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Privacybeleid" }]}
        titel="Privacybeleid"
        tekst={`Laatst bijgewerkt op ${formatDatumLang(BIJGEWERKT)}.`}
      />

      <section className="container-ukm py-10 lg:py-14">
        <div className="prose-ukm">
          <h2 id="wie">Wie is verantwoordelijk</h2>
          <p>
            {bedrijf.naam}, gevestigd aan de {bedrijf.adres.straat} in {bedrijf.adres.stad}, {bedrijf.adres.land}, is
            verantwoordelijk voor de verwerking van persoonsgegevens zoals beschreven in dit beleid. U bereikt ons op{" "}
            {bedrijf.telefoon} of via <a href={`mailto:${bedrijf.email}`}>{bedrijf.email}</a>.
          </p>

          <h2 id="gegevens">Welke gegevens we verwerken</h2>
          <p>
            In de winkel en via WhatsApp verwerken we alleen wat nodig is om een bestelling af te handelen: uw naam,
            telefoonnummer, en bij bezorging uw adres. Daarnaast bewaren we wat u besteld heeft, zodat we u bij
            vragen of garantie verder kunnen helpen.
          </p>
          <p>
            Op deze website worden geen persoonsgegevens naar een server gestuurd. Wat u invult in het
            contactformulier, bij het afrekenen of bij de nieuwsbrief blijft in uw browser en verdwijnt zodra u de
            pagina sluit.
          </p>

          <h2 id="opslag">Wat er in uw browser wordt opgeslagen</h2>
          <p>
            Om de winkel bruikbaar te houden bewaart deze site drie dingen lokaal in uw browser, via localStorage:
          </p>
          <ul>
            <li>
              <strong>Winkelwagen</strong> &ndash; welke artikelen u heeft toegevoegd en in welk aantal.
            </li>
            <li>
              <strong>Verlanglijst</strong> &ndash; de modellen die u heeft bewaard.
            </li>
            <li>
              <strong>Recent bekeken</strong> &ndash; de laatste acht producten die u heeft geopend.
            </li>
          </ul>
          <p>
            Deze gegevens staan alleen op uw eigen apparaat. Ze bevatten geen naam, adres of betaalgegevens, worden
            niet naar ons verstuurd en zijn voor niemand anders zichtbaar. U wist ze door de browsergegevens voor deze
            site te verwijderen.
          </p>

          <h2 id="cookies">Cookies en meten</h2>
          <p>
            Deze website plaatst geen volgcookies, gebruikt geen advertentienetwerken en meet geen bezoekersgedrag.
            Er is dan ook geen cookiemelding: er valt niets te weigeren.
          </p>

          <h2 id="derden">Delen met anderen</h2>
          <p>
            We verkopen uw gegevens niet en delen ze niet met derden voor commerciele doeleinden. Gegevens worden
            alleen gedeeld wanneer dat nodig is om een bestelling te bezorgen, of wanneer de wet ons daartoe verplicht.
          </p>

          <h2 id="bewaartermijn">Hoe lang we gegevens bewaren</h2>
          <p>
            Bestelgegevens bewaren we zolang dat nodig is voor garantie en administratie. Berichten via WhatsApp
            bewaren we zolang het gesprek loopt en verwijderen we daarna op verzoek.
          </p>

          <h2 id="rechten">Uw rechten</h2>
          <p>
            U mag ons vragen welke gegevens we van u hebben, ze laten corrigeren of laten verwijderen. Neem daarvoor
            contact op via <Link href="/contact">de contactpagina</Link>. We reageren zo snel mogelijk, en uiterlijk
            binnen een maand.
          </p>

          <h2 id="wijzigingen">Wijzigingen</h2>
          <p>
            Verandert de manier waarop we met gegevens omgaan, dan passen we dit beleid aan en werken we de datum
            bovenaan deze pagina bij.
          </p>
        </div>
      </section>
    </>
  );
}
