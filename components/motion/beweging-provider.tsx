"use client";

import { MotionConfig } from "framer-motion";

/**
 * Zet Framer Motion voor de hele site op "volg de systeeminstelling". Wie
 * verminderde beweging heeft aanstaan, krijgt geen verschuivingen te zien;
 * elementen springen direct naar hun eindpositie en vervagen alleen nog in.
 */
export function BewegingProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
