"use client";

import { motion } from "framer-motion";

/**
 * Zachte overgang tussen paginas in de winkel.
 *
 * Bewust alleen de doorzichtigheid: een transform op een ouder maakt een nieuw
 * containing block aan, en dan werken de vastgezette navigatiebalk en de
 * meeschuivende filterkolom niet meer. Verminderde beweging wordt al door de
 * MotionConfig in de layout afgehandeld.
 */
export default function WinkelTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
