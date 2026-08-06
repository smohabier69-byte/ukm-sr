import type { Metadata } from "next";
import Link from "next/link";

import { Paginakop } from "@/components/catalogus/paginakop";
import { bedrijf } from "@/lib/site";
import { formatDatumLang, formatPrijs } from "@/lib/format";

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  description: "De voorwaarden waaronder UKM.sr producten levert: bestellen, betalen, bezorgen, ruilen en garantie.",
  alternates: { canonical: "/algemene-voorwaarden" },
};

const BIJGEWERKT = "2026-07-27";

export default function VoorwaardenPagina() {
  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Algemene voorwaarden" }]}
        titel="Algemene voorwaarden"
        tekst={`Laatst bijgewerkt op ${formatDatumLang(BIJGEWERKT)}.`}
      />

      <section className="container-ukm py-10 lg:py-14">
        <div className="prose-ukm">
          <h2 id="toepasselijkheid">1. Toepasselijkheid</h2>
          <p>
            Deze voorwaarden gelden voor elke bestelling bij {bedrijf.naam}, gevestigd aan de {bedrijf.adres.straat} in{" "}
            {bedrijf.adres.stad}. Afwijkende afspraken gelden alleen wanneer we die vooraf schriftelijk hebben
            bevestigd.
          </p>

          <h2 id="aanbod">2. Aanbod en prijzen</h2>
          <p>
            Alle prijzen zijn in Surinaamse dollar en inclusief {Math.round(bedrijf.btwTarief * 100)} procent BTW. Het
            aanbod geldt zolang de voorraad strekt. We doen ons best om kleuren op foto zo natuurgetrouw mogelijk weer
            te geven, maar de weergave kan per scherm verschillen.
          </p>
          <p>
            Kennelijke vergissingen of typefouten in prijzen en omschrijvingen binden ons niet. Ontdekken we een fout
            nadat u besteld heeft, dan nemen we contact op voordat we iets leveren.
          </p>

          <h2 id="bestellen">3. Bestellen</h2>
          <p>
            Een bestelling komt tot stand wanneer wij die per bericht of in de winkel bevestigen. We mogen een
            bestelling weigeren, bijvoorbeeld wanneer een artikel niet meer op voorraad is of wanneer de gegevens
            onvolledig zijn.
          </p>

          <h2 id="betalen">4. Betalen</h2>
          <p>Betalen kan op drie manieren:</p>
          <ul>
            <li>Contant, bij ontvangst of in de winkel.</li>
            <li>Per bankoverschrijving; de gegevens ontvangt u bij de bevestiging.</li>
            <li>Met pin, in de winkel of bij bezorging.</li>
          </ul>
          <p>Bij bankoverschrijving verzenden we zodra het bedrag is bijgeschreven.</p>

          <h2 id="bezorging">5. Bezorging en afhalen</h2>
          <p>
            Bezorging binnen {bedrijf.adres.stad} kost {formatPrijs(bedrijf.bezorgingVanaf)}. Vanaf{" "}
            {formatPrijs(bedrijf.gratisBezorgingVanaf)} bezorgen we gratis. Afhalen aan de {bedrijf.adres.straat} is
            kosteloos.
          </p>
          <p>
            Genoemde bezorgtermijnen zijn een indicatie. We spreken altijd eerst een moment af. Lukt bezorging niet
            binnen een redelijke termijn, dan hoort u dat van ons en kunt u de bestelling kosteloos annuleren.
          </p>

          <h2 id="ruilen">6. Ruilen en herroeping</h2>
          <p>
            Een montuur kunt u binnen zeven dagen na ontvangst ruilen, mits ongedragen en in de originele verpakking
            met hoes en doekje. Neem daarvoor eerst contact op.
          </p>
          <p>
            <strong>Lenzen kunnen na opening niet worden geruild of geretourneerd.</strong> Dat is een hygienische
            grens die we niet kunnen oprekken: een geopende lens is niet opnieuw veilig te verkopen.
          </p>

          <h2 id="garantie">7. Garantie en klachten</h2>
          <p>
            Op productiefouten geven we garantie. Meld een klacht binnen zeven dagen na ontdekking via{" "}
            <Link href="/contact">de contactpagina</Link>, met uw bestelnummer en zo mogelijk een foto. Bij een
            terechte klacht herstellen we, vervangen we of betalen we terug.
          </p>
          <p>
            Buiten de garantie vallen schade door vallen, krassen door onjuist reinigen, en normale slijtage van
            coating of scharnieren.
          </p>

          <h2 id="gebruik">8. Verantwoord gebruik</h2>
          <p>
            Onze producten zijn geen vervanging van medisch advies. Draag lenzen nooit langer dan aanbevolen, slaap er
            niet mee en volg de hygieneregels die bij elke bestelling worden meegeleverd. Heeft u klachten aan uw ogen,
            raadpleeg dan een opticien of oogarts.
          </p>
          <p>
            De sterkte die u opgeeft, nemen wij over zoals opgegeven. Controleer die goed; wij voeren zelf geen
            oogmetingen uit.
          </p>

          <h2 id="aansprakelijkheid">9. Aansprakelijkheid</h2>
          <p>
            Onze aansprakelijkheid is beperkt tot het bedrag van de betreffende bestelling. We zijn niet aansprakelijk
            voor schade die ontstaat door gebruik in strijd met de meegeleverde instructies.
          </p>

          <h2 id="recht">10. Toepasselijk recht</h2>
          <p>
            Op elke overeenkomst is Surinaams recht van toepassing. Geschillen leggen we voor aan de bevoegde rechter
            in Paramaribo, nadat we eerst hebben geprobeerd er samen uit te komen.
          </p>
        </div>
      </section>
    </>
  );
}
