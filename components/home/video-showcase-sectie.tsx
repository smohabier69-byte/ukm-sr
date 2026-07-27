import { ProductVideoShowcase } from "@/components/media/product-video-showcase";
import { Sectiekop } from "@/components/home/sectiekop";
import { Onthul } from "@/components/motion/onthul";

/**
 * Echte opnames uit de winkel, niet gestileerde productfoto's. Bewust laat in
 * de homepagina geplaatst: na de productsecties, vlak voor de nieuwsbrief, zodat
 * het als een menselijke bevestiging landt voordat de bezoeker vertrekt.
 */
export function VideoShowcaseSectie() {
  return (
    <section className="container-ukm py-14 lg:py-20">
      <Sectiekop
        bovenschrift="In de winkel"
        titel="Zo past het in het echt"
        tekst="Geen studio-opname, maar hoe de monturen er in het dagelijks leven uitzien."
        gecentreerd
      />

      <Onthul richting="omhoog" vertraging={0.1}>
        <ProductVideoShowcase
          bron="/media/showcase/producten-showcase.mp4"
          poster="/media/showcase/producten-showcase-poster.jpg"
          titel="Brillen uitgeprobeerd bij UKM.sr"
        />
      </Onthul>
    </section>
  );
}
