import "server-only";
import { SquareClient, SquareEnvironment } from "square";

/**
 * Server-only Square client. The access token must never reach a client bundle,
 * hence the "server-only" import guard above.
 */
function omgeving(): SquareEnvironment {
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox;
}

let instantie: SquareClient | null = null;

export function squareClient(): SquareClient {
  if (instantie) return instantie;

  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) {
    throw new Error("SQUARE_ACCESS_TOKEN ontbreekt. Vul .env.local in voor lokaal gebruik.");
  }

  instantie = new SquareClient({ token, environment: omgeving() });
  return instantie;
}

export function squareLocationId(): string {
  const id = process.env.SQUARE_LOCATION_ID;
  if (!id) {
    throw new Error("SQUARE_LOCATION_ID ontbreekt. Vul .env.local in voor lokaal gebruik.");
  }
  return id;
}
