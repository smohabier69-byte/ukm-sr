# Website orders to WhatsApp

Production: https://ukm-sr.com. The UKM TCT account forwards saved website orders to the owner-selected group once per minute.

- Website secret: production-only `BESTELLING_BOT_SLEUTEL` in Vercel.
- Bot secret: private `/etc/ukm-bot/website-orders.key`; never commit or send it in a group.
- Generated bot plugin: `/srv/ukm-bot/data/plugins/ukm-bestellingen.lua`, owned by `ukmbot`, mode 0600.
- The build runs `scripts/init-bestellingen.mjs` when the bot secret is configured. It adds only the `bestelling` table if absent.
- An owner sends `.ukmbestel hier` in the intended group to select the destination. `.ukmbestel status`, `.ukmbestel test`, `.ukmbestel uit` and `.ukmbestel aan` are available.
- Orders stay in the website queue until forwarded and acknowledged. A per-order bot marker prevents resending after an acknowledgement failure. An interrupted process between the network send and recording its marker can still produce a duplicate; the order number identifies it.
- The bot sends notifications only. It does not mark orders paid, accept them, reserve stock or promise delivery.
- Keep both the website deployment and the bot plugin running. The customer-service chatbot remains a separate plugin.

A clearly labelled integration test may remain in the order table for audit; it is not a real order and must not be fulfilled.
