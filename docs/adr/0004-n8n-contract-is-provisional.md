# The n8n contract is provisional until validated against the real workflow

The webhook request and response shapes in `docs/api.md` were defined client-side because the n8n workflow's contract was not available during architecture. Every field and every response property there is marked **PENDIENTE**; the app parses the response with valibot schemas in one place, so validating against the real workflow later is a schema edit, not a rewrite.

## Considered Options

- **Wait for the real contract before designing**: would have blocked the entire architecture on an external dependency for no gain — the layer boundaries are independent of field names.
- **Build against an assumed contract silently**: the expensive option; a mismatch would surface mid-implementation.

## Consequences

- `src/data/api/` owns the DTO schemas; nothing else in the app knows the wire format.
- Idempotency of the POST is unknown, so there are **no automatic retries** on generation: the user retries explicitly, and HTTP 5xx/timeout surfaces as a typed error state.
- Until validated: no assumption about auth, field names, response wrappers, or error payloads may be treated as final.
