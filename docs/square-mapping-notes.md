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
   - Daarna nogmaals volledig herhaald **buiten de SDK om, rechtstreeks via
     `fetch()` tegen `connect.squareupsandbox.com/v2/catalog/object`** met
     Square's eigen gedocumenteerde voorbeeld-payload vrijwel woordelijk
     nagebouwd (inclusief `Square-Version: 2025-02-20`, de exacte
     `custom_attribute_values`-vorm uit hun docs). Zelfde resultaat: de
     upsert-respons zelf (niet alleen een latere read) toont het veld al
     niet, status 200, geen `errors`-array.
   - Ook `app_visibility` als variabele getest: een gloednieuwe attribuut-
     definitie aangemaakt met `APP_VISIBILITY_READ_WRITE_VALUES` in plaats
     van `APP_VISIBILITY_HIDDEN` (voor het geval de documentatie-belofte dat
     de aanmakende app altijd toegang houdt niet klopt) — zelfde nulresultaat.
   - **Conclusie: dit is een reproduceerbaar nulresultaat, geen giswerk, en
     geen SDK-bug** — elke client-side variabele die redelijkerwijs getest kon
     worden (SDK vs rechtstreekse REST, SELECTION vs STRING, definitie-id vs
     -key als mapsleutel, eigen vs server-toegewezen selection-uid,
     app_visibility HIDDEN vs READ_WRITE_VALUES, API-versie gelijk aan
     Square's eigen werkende voorbeeld) is stuk voor stuk uitgesloten. Wat
     overblijft: een echt platformprobleem, mogelijk specifiek voor dit
     sandbox-testaccount (databeschadiging, migratie-inconsistentie, of een
     niet-gedocumenteerde planbeperking). Voordat Fase 2 definitief op custom
     attributes leunt voor Techniek/Sterktesoort/Montuurvorm/Kleurfamilie/Merk,
     moet dit opgelost zijn — realistisch alleen nog op te lossen via
     Square-support (met deze precieze reproductiestappen) of door hetzelfde
     te testen tegen een ander sandbox-account of het echte productieaccount
     van de eigenaar, plus de eerder voorgestelde dashboard-test (handmatig
     een custom attribute invullen in de Square Dashboard-UI en kijken of die
     via de API zichtbaar wordt).

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

## Workaround: meerdere categorieën per product, in plaats van custom attributes

Een supportverzoek staat klaar (`docs/square-support-report.md`) maar heeft
geen voorspelbare doorlooptijd. In plaats van Fase 2/3 daarop te laten
wachten: **categorieën ondersteunen aantoonbaar meerdere toewijzingen per
item, en dat blijft wél hangen.** Getest: een bestaand item kreeg twee
extra, niet-hiërarchische categorieën toegewezen naast zijn gewone
navigatiecategorie, en beide kwamen correct terug bij het uitlezen.

Square kent geen apart categorietype voor "facet/tag" (alleen
`REGULAR_CATEGORY`, `MENU_CATEGORY`, `KITCHEN_CATEGORY` bestaan) - dit is dus
een naamgevingsconventie bovenop gewone categorieën, geen native
Square-functie. Elke as die eerder een custom attribute was, wordt een
platte set categorieën met een prefix:

- `Techniek: PTC`, `Techniek: Non-PTC`
- `Sterktesoort: Met sterkte`, `Sterktesoort: Zonder sterkte`
- `Vorm: Cat-eye`, `Vorm: Square`, ... (11 stuks)
- `Kleurfamilie: Bruin`, ... (7 stuks)
- `Merk: UKM Signature`, ... (6 stuks)

Een product krijgt zijn gewone navigatiecategorie (bijv. "PTC photochrome
brillen") plus alle van toepassing zijnde facet-categorieën in dezelfde
`categories`-array. Bij het uitlezen (Fase 3) worden facet-categorieën
herkend aan de prefix vóór de dubbele punt en teruggemapt naar het juiste
veld op `Product`.

**Nadelen, bewust geaccepteerd:** minder schoon dan custom attributes (geen
gestructureerd type/schema, alleen een naamconventie); een tikfout in de
prefix breekt de mapping stilzwijgend; de categorieënlijst in de Square
Dashboard wordt drukker met facetten die niets met echte navigatie te maken
hebben. Zodra bevinding 8 door Square is opgelost (of blijkt
sandbox-specifiek te zijn en werkt wel op het echte account), is overstappen
naar custom attributes een geïsoleerde wijziging in de synclaag (Fase 3),
niet in het datamodel van de site zelf (`types/product.ts` verandert niet).

**Vanaf-prijs (sale/was-prijs)** blijft een custom attribute op
`ITEM_VARIATION` - dat is geen kenmerk om op te filteren dus een categorie
past hier niet. Tot bevinding 8 is opgelost heeft geen enkel product een
"vanaf"-prijs in de sync; dat is acceptabel (het is een marketingextraatje,
geen kernfunctie) en wordt in Fase 3 gewoon overgeslagen totdat custom
attributes werken.

## Gevolg voor de Fase 2 mappingtabel

Techniek, Sterktesoort, Montuurvorm, Kleurfamilie en Merk gaan naar de
categorie-workaround hierboven, niet naar custom attributes - dit is nu de
**vastgestelde aanpak voor Fase 3**, geen voorbehoud meer. Vanaf-prijs blijft
een custom attribute en wordt pas gesynchroniseerd zodra bevinding 8 is
opgelost. Kleur/swatch (Item Option) en categorieën zijn definitief
bevestigd en vaststaand.
