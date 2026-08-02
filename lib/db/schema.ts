import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  boolean,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

/**
 * De users/accounts/sessions/verificationTokens-tabellen volgen exact de
 * conventie die de Auth.js Drizzle-adapter verwacht (kolomnamen inbegrepen).
 * Nu al aanwezig, ook al gebruiken we vandaag alleen Credentials: een
 * OAuth-provider (Google, Facebook) later toevoegen wordt dan config,
 * geen migratie.
 */
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  /** Alleen gezet bij Credentials-registratie; leeg voor een toekomstige OAuth-only gebruiker. */
  passwordHash: text("passwordHash"),
  phone: text("phone"),
  /**
   * Koppeling naar de Square Customer, lazy aangemaakt bij de eerste
   * bestelling. Dit is de enige sleutel om bestelgeschiedenis bij Square op
   * te vragen - er is bewust geen eigen orders-tabel.
   */
  squareCustomerId: text("squareCustomerId").unique(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

/**
 * Wachtwoord-herstel staat los van verificationTokens (die zijn voor
 * Auth.js' eigen magic-link/e-mailverificatieflow): een eigen tabel houdt
 * de herstelflow onder onze eigen controle, inclusief het moment van
 * gebruik.
 */
export const passwordResetTokens = pgTable("password_reset_token", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("tokenHash").notNull(),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
  usedAt: timestamp("usedAt", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Adressen staan lokaal, niet in Square's klantenboek: Square's Orders API
 * accepteert een adres direct bij het aanmaken van een bestelling, dus een
 * Square Customer hoeft niet te bestaan voordat iemand een adres kan
 * opslaan.
 */
export const addresses = pgTable("address", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  naam: text("naam").notNull(),
  straat: text("straat").notNull(),
  wijk: text("wijk"),
  plaats: text("plaats").notNull(),
  land: text("land").default("Suriname").notNull(),
  telefoon: text("telefoon"),
  isStandaard: boolean("isStandaard").default(false).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Verlanglijst voor ingelogde gebruikers. De anonieme verlanglijst in
 * localStorage (lib/winkel/stores.ts) blijft ongewijzigd voor bezoekers die
 * niet inloggen; bij de eerste keer inloggen wordt die eenmalig hierheen
 * gemigreerd.
 */
export const wishlistItems = pgTable(
  "wishlist_item",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Het Square-catalogusobject (of de huidige productslug voor de sync live is). */
    squareCatalogObjectId: text("squareCatalogObjectId").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("wishlist_user_item_idx").on(t.userId, t.squareCatalogObjectId)],
);
