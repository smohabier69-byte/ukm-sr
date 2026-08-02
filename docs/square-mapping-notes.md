# Square catalog mapping — Fase 0 bevindingen

Verzameld op 2026-08-02 tegen een echte Square sandbox, met een representatieve
steekproef van het **echte** UKM-assortiment (`data/producten.ts`, zelf ooit uit
de officiele prijslijst-PDF's geëxtraheerd — geen verzonnen testdata). Zie
`scripts/square-catalog-seed.ts` voor de seed en `scripts/square-catalog-explore.mjs`
voor de uitlees-tooling.

## Bevestigd, werkt zoals verwacht

1. **Geneste categorieën werken.** Een kind-categorie met `parentCategory: { id }`
   krijgt correct `isTopLevel: false`, `rootCategory` en `pathToRoot` terug.
   Brillen → PTC/Anti-blauwlicht/Kinderbrillen en Lenzen → Met/Zonder sterkte
   zijn zo 1-op-1 te modelleren.
2. **Kleur op een Item Option Value is nativief mogelijk** (`showColors: true`
   op de `ITEM_OPTION`, `color` op elke `ITEM_OPTION_VAL`) — geen aparte custom
   attribute nodig voor swatches.
   - **Belangrijk, afwijkend van de SDK-documentatie:** het `color`-veld
     accepteert alleen **6-cijferige hex zonder "#" en zonder alfakanaal**
     (bijv. `"1b1b1b"`). De SDK's eigen voorbeeld (`"#ff8d4e85"`, met "#" en
     alfa) wordt geweigerd met `INVALID_VALUE`. Geverifieerd met meerdere
     varianten (`#1B1B1B`, `1b1b1b`, `#1b1b1bFF`, `1b1b1bff`) — alleen de kale
     6-cijferige vorm werd geaccepteerd.
3. **Item Options + variaties werken end-to-end.** Een montuur met kleurvarianten
   (bijv. "PTC Small Square" met Zwart/Rose gold/Zilver) kreeg drie
   `ITEM_VARIATION`s die elk correct naar hun `ITEM_OPTION_VAL` verwijzen.
4. **SKU is een native veld** op `ITEM_VARIATION.sku` — geen custom attribute
   nodig, zoals verwacht.
5. **De valuta van een prijs moet exact overeenkomen met de valuta van het
   (test)account.** Dit sandboxaccount staat op **USD**, niet SRD — een
   verzoek met `currency: "SRD"` werd afgewezen (`merchant currency USD -
   currency in request SRD`).

## Open vraag, nog niet beantwoord door dit account

6. **Merk / native brand-ondersteuning**: nog niet apart getoetst — de
   steekproef gebruikte hiervoor (net als Techniek/Sterktesoort/Montuurvorm/
   Kleurfamilie) een `SELECTION`-type custom attribute definition, wat
   probleem 7 hieronder raakt.
7. **Custom attribute images/`image_url`-host**: nog niet getoetst; er zijn
   in deze steekproef bewust geen afbeeldingen geupload (dat vereist een
   losse multipart-upload via `CreateCatalogImage`, een aparte stap).

## Onopgelost — echt probleem, geen aanname

8. **`customAttributeValues` op een `ITEM` blijven niet hangen.** Dit is
   grondig geïsoleerd, niet zomaar één mislukte poging:
   - Eerst geprobeerd met een `SELECTION`-attribuut (Techniek) en de
     map-key op de definitie-**id** — geen fout, maar leeg bij het uitlezen.
   - Herprobeerd met de map-key op de definitie-**`key`**-string (zoals de
     documentatie van `CatalogObjectBase.customAttributeValues` letterlijk
     voorschrijft) — nog steeds leeg.
   - Versie-mismatch-fouten onderweg opgelost door de actuele `version` eerst
     op te halen via `catalog.object.get()` en die exact terug te sturen.
   - Volledig geïsoleerd met een gloednieuwe, kale `STRING`-type custom
     attribute (dus niet-SELECTION-specifiek) met zowel `key` als
     `customAttributeDefinitionId` gezet op de waarde, en uitgelezen met
     zowel `catalog.search()` als een directe `catalog.object.get()` — de
     upsert meldt succes (`item upsert: ok`, geen `errors`-array), maar geen
     van beide leesmethodes toont ooit een `customAttributeValues`-veld op
     het item terug.
   - **Conclusie: dit is een reproduceerbaar nulresultaat, geen giswerk.**
     Ofwel ontbreekt er nog een vereist veld dat nergens in de SDK-typen of
     -documentatie terugkomt, ofwel ondersteunt dit sandbox-testaccount
     (mogelijk plan-afhankelijk) het schrijven van custom attribute values
     op `ITEM`-objecten niet. Voordat Fase 2 definitief op custom attributes
     leunt voor Techniek/Sterktesoort/Montuurvorm/Kleurfamilie/Merk, moet dit
     opgelost zijn — via Square-support, een ander accounttype, of een
     dashboard-test (handmatig een custom attribute invullen in de Square
     Dashboard-UI en kijken of die via de API wel zichtbaar wordt).

## Bijvangst, niet in de oorspronkelijke vragenlijst

9. **Upsert van een bestaand object vervangt het hele `<type>Data`-blok, geen
   partial merge.** Een `ITEM`-update zonder `variations` erin faalt met
   *"must have at least one variation"* — elke update moet het complete
   item (incl. bestaande variaties) opnieuw meesturen. Relevant mocht er
   ooit vanaf de website naar Square teruggeschreven worden (nu niet het
   geval: de sync is bewust alleen-lezen).
10. **Updates vereisen de exacte huidige `version`**, opgehaald vlak voor de
    schrijfactie — een verouderde of ontbrekende versie geeft
    `VERSION_MISMATCH`. Bij nieuwe objecten (`#`-tijdelijke id's) speelt dit
    niet.

## Gevolg voor de Fase 2 mappingtabel

De rijen die op custom attributes leunen (Techniek, Sterktesoort,
Montuurvorm, Kleurfamilie, Merk, Vanaf-prijs) staan **onder voorbehoud** tot
bevinding 8 is opgelost. Kleur/swatch en categorieën zijn wel definitief
bevestigd en kunnen als vaststaand gelden.
