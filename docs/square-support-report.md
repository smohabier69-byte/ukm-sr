# Ready to post — Square Developer Forums

Square consolidated all developer support into their public forum:
**https://developer.squareup.com/forums/**

1. Log in (top right).
2. Click "New Topic".
3. Category: **Questions**. Suggested tags: `catalog-api`, `sandbox`.
4. Title and body below — copy as-is.

---

**Title:**

`custom_attribute_values on an ITEM silently don't persist (sandbox) — reproduced without the SDK`

**Body:**

I'm building a Catalog API integration against a sandbox test account and can't get `custom_attribute_values` to persist on an `ITEM` object. The write reports success (200, no `errors` array) but the value is never present on read-back — not even in the write response itself.

**Environment:** Sandbox, `Square-Version: 2025-02-20`, app id `sandbox-sq0idb-f-65nNciqV7hMiXosjEfGg`.

**What I've ruled out**, each tested independently:

- **SDK vs raw REST** — reproduced identically calling `fetch()` directly against `connect.squareupsandbox.com/v2/catalog/object`, bypassing the `square` npm SDK entirely, using your own documented example payload from [the custom attributes guide](https://developer.squareup.com/docs/catalog-api/add-custom-attributes) almost verbatim.
- **SELECTION vs STRING type** — same result on both a `SELECTION`-type attribute and a fresh, minimal `STRING`-type attribute.
- **Map key = definition id vs definition `key`** — tried both; your docs specify the `key` string should be the map key, tested that exactly.
- **Selection UID** — tried both a client-supplied `#`-prefixed temp UID and the real server-assigned UID (fetched after the definition was created).
- **`app_visibility`** — tried both `APP_VISIBILITY_HIDDEN` (my original attributes) and a brand-new attribute created with `APP_VISIBILITY_READ_WRITE_VALUES`, in case the "creating app always has access" guarantee in your docs doesn't apply as documented. Same result.
- **API version** — pinned to `2025-02-20` to match your own working doc example exactly (rather than the SDK's default `2026-07-15`).
- **Stale version** — confirmed I'm always sending the freshly-fetched `version` before the write (ruled out `VERSION_MISMATCH` as a red herring).

**Minimal repro:**

1. Create a `CUSTOM_ATTRIBUTE_DEFINITION` (type `STRING`, `allowed_object_types: ["ITEM"]`, key `test_string`).
2. Create/update an `ITEM` with:
   ```json
   "custom_attribute_values": {
     "test_string": {
       "key": "test_string",
       "custom_attribute_definition_id": "<the definition id>",
       "type": "STRING",
       "string_value": "hello"
     }
   }
   ```
3. Response to that very write already omits `custom_attribute_values` from the returned object.
4. A subsequent `RetrieveCatalogObject` on that item also shows no `custom_attribute_values`.

Is this a known sandbox-specific issue, or is there an undocumented requirement I'm missing? Happy to share the exact request/response bodies if useful.

---

*(Context for whoever's posting this: this blocks a taxonomy mapping — technique, frame shape, prescription type, brand — for an e-commerce catalog sync. Once resolved, worth re-testing against the production account too, in case it's sandbox-specific.)*
