"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { bedrijf } from "@/lib/site";

type Bericht = {
  rol: "gebruiker" | "assistent";
  tekst: string;
};

const WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL ?? "https://n8n-ukmsr.app.n8n.cloud/webhook/ukmsr-website-chat";

const WELKOMSTBERICHT: Bericht = {
  rol: "assistent",
  tekst: `Hoi! Ik ben de assistent van ${bedrijf.naam}. Waarmee kan ik je helpen — brillen, kleurlenzen, prijzen of bezorging?`,
};

/** Genereert (of hergebruikt) een sessie-ID zodat het gesprek geheugen heeft binnen dit tabblad. */
function haalSessieId(): string {
  const sleutel = "ukmsr-chat-sessie-id";
  const bestaand = window.sessionStorage.getItem(sleutel);
  if (bestaand) return bestaand;
  const nieuw = crypto.randomUUID();
  window.sessionStorage.setItem(sleutel, nieuw);
  return nieuw;
}

/** Zwevende chatwidget rechtsonder in beeld, gekoppeld aan de n8n-webchat-bridge. */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [berichten, setBerichten] = useState<Bericht[]>([WELKOMSTBERICHT]);
  const [invoer, setInvoer] = useState("");
  const [bezigMetVerzenden, setBezigMetVerzenden] = useState(false);
  const sessieIdRef = useRef<string>("");
  const berichtenEindeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessieIdRef.current = haalSessieId();
  }, []);

  useEffect(() => {
    berichtenEindeRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [berichten, bezigMetVerzenden]);

  async function verstuur() {
    const bericht = invoer.trim();
    if (!bericht || bezigMetVerzenden) return;

    setBerichten((huidige) => [...huidige, { rol: "gebruiker", tekst: bericht }]);
    setInvoer("");
    setBezigMetVerzenden(true);

    try {
      const respons = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: bericht, sessionId: sessieIdRef.current }),
      });

      if (!respons.ok) throw new Error(`Onverwachte status: ${respons.status}`);

      const data: { reply?: string } = await respons.json();
      const antwoord = data.reply?.trim() || "Sorry, daar kon ik zo geen antwoord op vinden. Probeer het nog eens?";
      setBerichten((huidige) => [...huidige, { rol: "assistent", tekst: antwoord }]);
    } catch {
      setBerichten((huidige) => [
        ...huidige,
        {
          rol: "assistent",
          tekst: "Sorry, er ging iets mis bij het versturen. Probeer het zo nog eens, of app ons rechtstreeks.",
        },
      ]);
    } finally {
      setBezigMetVerzenden(false);
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((huidig) => !huidig)}
        aria-label={open ? "Chat sluiten" : "Chat openen"}
        className="fixed right-5 bottom-5 z-50 flex size-14 items-center justify-center rounded-full bg-salie-700 text-white shadow-zwevend transition-colors hover:bg-salie-800 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none md:right-8 md:bottom-8"
        whileTap={{ scale: 0.94 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "sluiten" : "openen"}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label={`Chat met ${bedrijf.naam}`}
            className="fixed inset-x-4 bottom-24 z-50 flex h-[min(32rem,calc(100dvh-8rem))] flex-col overflow-hidden rounded-3xl border border-border/70 bg-creme shadow-zwevend sm:inset-x-auto sm:right-5 sm:w-96 md:right-8 md:bottom-28"
          >
            <div className="flex items-center gap-3 border-b border-border/70 bg-salie-700 px-5 py-4 text-white">
              <div className="flex size-9 items-center justify-center rounded-full bg-white/15">
                <MessageCircle className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-semibold">{bedrijf.naam}</p>
                <p className="truncate text-xs text-white/75">Meestal binnen enkele minuten antwoord</p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {berichten.map((bericht, index) => (
                <div
                  key={index}
                  className={cn("flex", bericht.rol === "gebruiker" ? "justify-end" : "justify-start")}
                >
                  <p
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                      bericht.rol === "gebruiker"
                        ? "rounded-br-sm bg-salie-700 text-white"
                        : "rounded-bl-sm bg-white text-inkt shadow-zacht",
                    )}
                  >
                    {bericht.tekst}
                  </p>
                </div>
              ))}
              {bezigMetVerzenden && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-zacht">
                    <span className="size-1.5 animate-bounce rounded-full bg-inkt-zacht [animation-delay:-0.3s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-inkt-zacht [animation-delay:-0.15s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-inkt-zacht" />
                  </div>
                </div>
              )}
              <div ref={berichtenEindeRef} />
            </div>

            <form
              onSubmit={(gebeurtenis) => {
                gebeurtenis.preventDefault();
                void verstuur();
              }}
              className="flex items-center gap-2 border-t border-border/70 bg-creme px-3 py-3"
            >
              <input
                type="text"
                value={invoer}
                onChange={(gebeurtenis) => setInvoer(gebeurtenis.target.value)}
                placeholder="Typ je bericht..."
                aria-label="Je bericht"
                className="h-11 flex-1 rounded-full border border-border/70 bg-white px-4 text-sm text-inkt placeholder:text-inkt-zacht/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
              <button
                type="submit"
                disabled={!invoer.trim() || bezigMetVerzenden}
                aria-label="Versturen"
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-salie-700 text-white transition-colors hover:bg-salie-800 disabled:pointer-events-none disabled:opacity-50"
              >
                <Send className="size-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
