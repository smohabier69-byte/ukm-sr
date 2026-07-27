export interface Medewerker {
  id: string;
  naam: string;
  rol: string;
  afdeling: "Winkel" | "Verkoop" | "Magazijn" | "Kantoor";
  email: string;
  telefoon: string;
  inDienstSinds: string;
  actief: boolean;
  /** Wat deze rol in het beheerpaneel mag; puur ter illustratie. */
  rechten: string[];
}

/**
 * Vaste bezetting van de winkel. Klein team, zoals bij een zaak van deze
 * omvang gebruikelijk is; de rollen bepalen wat iemand in dit paneel zou zien.
 */
export const medewerkers: Medewerker[] = [
  {
    id: "M-01",
    naam: "Rachel Amatali",
    rol: "Eigenaar",
    afdeling: "Kantoor",
    email: "rachel@ukm.sr",
    telefoon: "8411203",
    inDienstSinds: "2023-02-01",
    actief: true,
    rechten: ["Volledig beheer", "Rapportages", "Instellingen"],
  },
  {
    id: "M-02",
    naam: "Devi Sewnarain",
    rol: "Winkelmanager",
    afdeling: "Winkel",
    email: "devi@ukm.sr",
    telefoon: "8452118",
    inDienstSinds: "2023-06-15",
    actief: true,
    rechten: ["Bestellingen", "Voorraad", "Klanten"],
  },
  {
    id: "M-03",
    naam: "Marlon Pinas",
    rol: "Verkoopmedewerker",
    afdeling: "Verkoop",
    email: "marlon@ukm.sr",
    telefoon: "8730944",
    inDienstSinds: "2024-03-04",
    actief: true,
    rechten: ["Bestellingen", "Klanten"],
  },
  {
    id: "M-04",
    naam: "Soraya Doerga",
    rol: "Opticienassistent",
    afdeling: "Winkel",
    email: "soraya@ukm.sr",
    telefoon: "8612077",
    inDienstSinds: "2024-09-12",
    actief: true,
    rechten: ["Bestellingen", "Voorraad"],
  },
  {
    id: "M-05",
    naam: "Kishan Bhagwandas",
    rol: "Magazijn en bezorging",
    afdeling: "Magazijn",
    email: "kishan@ukm.sr",
    telefoon: "8558431",
    inDienstSinds: "2025-01-20",
    actief: true,
    rechten: ["Voorraad", "Bezorgingen"],
  },
  {
    id: "M-06",
    naam: "Chantal Refos",
    rol: "Administratie",
    afdeling: "Kantoor",
    email: "chantal@ukm.sr",
    telefoon: "8294760",
    inDienstSinds: "2025-08-01",
    actief: false,
    rechten: ["Rapportages"],
  },
];
