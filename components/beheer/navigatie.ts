import {
  BadgePercent,
  Boxes,
  ChartNoAxesCombined,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  Users,
  UserCog,
  Layers,
} from "lucide-react";

export interface Beheerlink {
  label: string;
  href: string;
  icoon: typeof LayoutDashboard;
}

export interface Beheergroep {
  titel: string;
  links: Beheerlink[];
}

export const beheernavigatie: Beheergroep[] = [
  {
    titel: "Overzicht",
    links: [
      { label: "Dashboard", href: "/beheer", icoon: LayoutDashboard },
      { label: "Statistieken", href: "/beheer/statistieken", icoon: ChartNoAxesCombined },
      { label: "Rapporten", href: "/beheer/rapporten", icoon: FileText },
    ],
  },
  {
    titel: "Verkoop",
    links: [
      { label: "Bestellingen", href: "/beheer/bestellingen", icoon: ShoppingCart },
      { label: "Klanten", href: "/beheer/klanten", icoon: Users },
      { label: "Kortingscodes", href: "/beheer/kortingscodes", icoon: BadgePercent },
    ],
  },
  {
    titel: "Assortiment",
    links: [
      { label: "Producten", href: "/beheer/producten", icoon: Package },
      { label: "Voorraad", href: "/beheer/voorraad", icoon: Boxes },
      { label: "Categorieen", href: "/beheer/categorieen", icoon: Layers },
      { label: "Merken", href: "/beheer/merken", icoon: Tags },
    ],
  },
  {
    titel: "Organisatie",
    links: [
      { label: "Medewerkers", href: "/beheer/medewerkers", icoon: UserCog },
      { label: "Instellingen", href: "/beheer/instellingen", icoon: Settings },
    ],
  },
];

export const alleBeheerlinks = beheernavigatie.flatMap((groep) => groep.links);
