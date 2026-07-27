import { bedrijf } from "@/lib/site";
import { formatPrijs } from "@/lib/format";

export interface Vraag {
  vraag: string;
  antwoord: string;
}

export interface Vraaggroep {
  /** Ankernaam; wordt vanuit de navigatie en het megamenu aangesproken. */
  id: string;
  titel: string;
  vragen: Vraag[];
}

export const vraaggroepen: Vraaggroep[] = [
  {
    id: "bezorging",
    titel: "Bezorging en afhalen",
    vragen: [
      {
        vraag: "Wat kost bezorging?",
        antwoord: `Bezorging binnen ${bedrijf.adres.stad} kost ${formatPrijs(bedrijf.bezorgingVanaf)}. Vanaf een bestelbedrag van ${formatPrijs(bedrijf.gratisBezorgingVanaf)} bezorgen we gratis.`,
      },
      {
        vraag: "Hoe lang duurt het voordat mijn bestelling er is?",
        antwoord:
          "Bestellingen die op een werkdag voor 15:00 binnenkomen, gaan doorgaans dezelfde week nog de deur uit. We nemen altijd eerst contact op om een bezorgmoment af te spreken.",
      },
      {
        vraag: "Kan ik mijn bestelling zelf ophalen?",
        antwoord: `Ja. Afhalen kan aan de ${bedrijf.adres.straat}. Daar zijn geen kosten aan verbonden en u kunt het montuur meteen passen.`,
      },
      {
        vraag: "Bezorgen jullie ook buiten Paramaribo?",
        antwoord:
          "Daarvoor maken we per bestelling een afspraak. Stuur ons een bericht via WhatsApp met uw locatie, dan laten we weten wat mogelijk is.",
      },
    ],
  },
  {
    id: "sterkte",
    titel: "Sterkte en pasvorm",
    vragen: [
      {
        vraag: "Hoe weet ik welke sterkte ik nodig heb?",
        antwoord:
          "Neem de sterkte over van uw laatste oogmeting of van de verpakking van uw huidige lenzen. Twijfelt u, laat uw ogen dan opmeten door een opticien of oogarts. Wij geven graag advies, maar voeren zelf geen oogmetingen uit.",
      },
      {
        vraag: "Welke sterktes voeren jullie?",
        antwoord:
          "Onze kleurlenzen op sterkte lopen van -1.00 tot -8.00, afhankelijk van de kleur. Bij elk artikel staat het beschikbare bereik vermeld. Sommige kleuren zijn maar in een enkele sterkte leverbaar.",
      },
      {
        vraag: "Welke montuurvorm past bij mijn gezicht?",
        antwoord:
          "Als vuistregel: ronde en hartvormige gezichten komen goed uit bij een cat eye, hoekige gezichten bij ronde en ovale monturen, en langere gezichten bij bredere modellen. Bij elk product staat een advies, maar passen in de winkel blijft de beste test.",
      },
      {
        vraag: "Kan ik anti-blauwlicht glazen op mijn eigen sterkte krijgen?",
        antwoord:
          "De monturen in de webshop worden geleverd met heldere of photochrome glazen zonder sterkte. Voor glazen op sterkte kunt u langskomen in de winkel, dan bespreken we de mogelijkheden.",
      },
    ],
  },
  {
    id: "ptc",
    titel: "Anti-blauwlicht en PTC",
    vragen: [
      {
        vraag: "Wat doet een anti-blauwlicht bril?",
        antwoord:
          "De glazen filteren het blauwe licht van telefoons, laptops en televisies. Dat vermindert digitale oogvermoeidheid, helpt tegen hoofdpijn bij lange schermdagen en verstoort de aanmaak van melatonine minder, waardoor u makkelijker in slaap valt.",
      },
      {
        vraag: "Wat betekent PTC?",
        antwoord:
          "PTC staat voor Photochromic Technology Coating. Die coating zorgt dat het glas binnen helder blijft en in zonlicht binnen enkele seconden donker kleurt. U heeft dus bescherming tegen blauw licht en tegen UV in een montuur, zonder van bril te wisselen.",
      },
      {
        vraag: "Werkt PTC ook achter autoglas?",
        antwoord:
          "Maar beperkt. Autoruiten houden een groot deel van de UV-straling tegen en juist die straling zet de verkleuring in gang. In de auto kleurt het glas dus minder donker dan buiten.",
      },
      {
        vraag: "Kan ik een PTC-bril als zonnebril gebruiken?",
        antwoord:
          "In de meeste situaties wel: in vol zonlicht kleuren de glazen diep door en blokkeren ze UV tot 400 nm. Voor langdurig verblijf in extreem fel licht blijft een echte zonnebril met een hogere donkerheidscategorie prettiger.",
      },
    ],
  },
  {
    id: "hygiene",
    titel: "Lenzen en hygiene",
    vragen: [
      {
        vraag: "Hoe lang mag ik mijn lenzen dragen?",
        antwoord:
          "Draag modelenzen niet langer dan zes tot acht uur per dag en slaap er nooit mee. Krijgt u rode, jeukende of tranende ogen, doe ze dan direct uit en raadpleeg een specialist.",
      },
      {
        vraag: "Hoe maak ik lenzen schoon?",
        antwoord:
          "Was altijd eerst uw handen met zeep zonder olie of parfum. Reinig de lenzen uitsluitend met goedgekeurde lenzenvloeistof, nooit met kraanwater of speeksel. Spoel het lenzendoosje regelmatig en laat het aan de lucht drogen.",
      },
      {
        vraag: "Kan ik lenzen delen met iemand anders?",
        antwoord:
          "Nee. Draag nooit andermans lenzen en geef die van u niet door. Dat is de snelste manier om een ooginfectie op te lopen.",
      },
      {
        vraag: "Lenzen en make-up, waar moet ik op letten?",
        antwoord:
          "Doe de lenzen altijd in voordat u make-up opbrengt, en haal ze eruit voordat u die verwijdert. Gebruik hypoallergene producten en vermijd losse poeder vlak bij de ogen.",
      },
    ],
  },
  {
    id: "houdbaarheid",
    titel: "Houdbaarheid en garantie",
    vragen: [
      {
        vraag: "Hoe lang zijn de lenzen houdbaar?",
        antwoord:
          "Na openen zijn onze zachte kleurlenzen zes maanden houdbaar. Ongeopend geldt de datum op de verpakking; controleer die altijd voor gebruik.",
      },
      {
        vraag: "Zijn de lenzen gekeurd?",
        antwoord:
          "Ja. Onze lenzen zijn FDA, GMP, ISO en CE goedgekeurd. Het materiaal bestaat voor 58 tot 62 procent uit PHEMA met een watergehalte van 38 tot 42 procent.",
      },
      {
        vraag: "Wat als er iets mis is met mijn bestelling?",
        antwoord:
          "Neem binnen zeven dagen contact op via WhatsApp of telefoon en houd uw bestelnummer bij de hand. Bij een productiefout zorgen we voor een oplossing. Om hygienische redenen kunnen geopende lenzen niet worden geruild.",
      },
      {
        vraag: "Hoe onderhoud ik mijn montuur?",
        antwoord:
          "Reinig de glazen met het meegeleverde microvezeldoekje en lauw water; gebruik geen papier of schoonmaakmiddel, dat beschadigt de coating. Bewaar de bril in de hoes wanneer u hem niet draagt.",
      },
    ],
  },
  {
    id: "bestellen",
    titel: "Bestellen en betalen",
    vragen: [
      {
        vraag: "Hoe kan ik betalen?",
        antwoord:
          "Contant, per bankoverschrijving of met pin. Bij bezorging rekent u af bij ontvangst; bij overschrijving ontvangt u de gegevens per bericht.",
      },
      {
        vraag: "Zijn de prijzen inclusief BTW?",
        antwoord: `Ja. Alle prijzen in de webshop zijn winkelprijzen inclusief ${Math.round(bedrijf.btwTarief * 100)} procent BTW. In het overzicht bij het afrekenen ziet u welk deel van het totaal uit BTW bestaat.`,
      },
      {
        vraag: "Kan ik een artikel reserveren?",
        antwoord:
          "Dat kan. Stuur een bericht met de naam van het model, dan leggen we het maximaal twee dagen voor u apart in de winkel.",
      },
    ],
  },
];

export const alleVragen = vraaggroepen.flatMap((groep) => groep.vragen);
