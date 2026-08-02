import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

/**
 * HTTP-driver, geen persistente connectie: past bij Vercel's serverless
 * functies, waar een pool-gebaseerde driver al snel het verbindingslimiet
 * van de database opsoupeert onder gelijktijdige aanvragen.
 */
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
