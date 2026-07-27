"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

type Richting = "omhoog" | "omlaag" | "links" | "rechts" | "geen";

const verplaatsing: Record<Richting, { x: number; y: number }> = {
  omhoog: { x: 0, y: 24 },
  omlaag: { x: 0, y: -24 },
  links: { x: 24, y: 0 },
  rechts: { x: -24, y: 0 },
  geen: { x: 0, y: 0 },
};

/**
 * Onthult inhoud zodra die in beeld komt.
 *
 * De beginwaarden mogen niet afhangen van een mediaquery: de server kent die
 * niet en dan wijkt de eerste render af van wat React op de client verwacht.
 * Verminderde beweging wordt daarom een niveau hoger geregeld, door de
 * MotionConfig in BewegingProvider.
 */
export function Onthul({
  children,
  className,
  richting = "omhoog",
  vertraging = 0,
  duur = 0.6,
  ...props
}: HTMLMotionProps<"div"> & {
  richting?: Richting;
  vertraging?: number;
  duur?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, ...verplaatsing[richting] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: duur, delay: vertraging, ease: [0.16, 1, 0.3, 1] }}
      data-onthul className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Laat kinderen na elkaar binnenkomen. Gebruik samen met OnthulKind. */
export function OnthulGroep({
  children,
  className,
  tussenruimte = 0.07,
  ...props
}: HTMLMotionProps<"div"> & { tussenruimte?: number }) {
  return (
    <motion.div
      initial="verborgen"
      whileInView="zichtbaar"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ verborgen: {}, zichtbaar: { transition: { staggerChildren: tussenruimte } } }}
      data-onthul className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function OnthulKind({ children, className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={{
        verborgen: { opacity: 0, y: 20 },
        zichtbaar: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
      }}
      data-onthul className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

