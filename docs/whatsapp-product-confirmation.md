# Website orders: WhatsApp product confirmation

New website orders snapshot their selected product, variant, quantity and original catalog-photo path. Studio reconstructions are not used for confirmation. The bot sends those photos and the order summary to the checkout WhatsApp number. Only an explicit confirmation of the current order releases it to `website bestelling`, labelled **Bevestigd door klant**. UKM still checks stock and delivery.

- `bevestiging.status`: `wacht_op_bot` → `wacht_op_klant` → `bevestigd`.
- Rejection, a correction, an unavailable exact photo or staff takeover puts the order in `controle`; cancellation uses `geannuleerd`.
- No reply within 24 hours requires manual review. No timeout confirms an order.
- New confirmation orders are excluded from the legacy immediate group feed. `/afgeleverd` refuses acknowledgement before customer confirmation.
- The main support bot owns the confirmation flow, outbound echo ledger, staff pause and durable per-order send markers. The separate legacy plugin remains for orders created before this change.
- Repeated replies and acknowledgement retries reuse per-order markers. Like the existing native WhatsApp transport, an accepted send is not a handset delivery receipt; a process crash between sending and persisting can still require checking for a duplicate.
- Missing/future catalog-photo mappings require manual review. To refresh, run `npx tsx scripts/export-confirmation-photos.ts`, package the original files and update the bot's approved media mapping and manifest.

Validation: `node scripts/test-confirmation-api.mjs`, `npx tsc --noEmit`, focused ESLint and the captured native Lua confirmation flow tests. These do not create real orders or send customer messages.
