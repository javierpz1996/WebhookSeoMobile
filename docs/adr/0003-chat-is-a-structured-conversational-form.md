# The chat is a structured conversational form, not free-form natural language

The Chat builds a `Generation` step by step: every message maps to a typed, client-validated field of `GenerationParams`, and the complete set is packaged as multipart/form-data for n8n. Free text is only an optional extra field (`prompt`) sent alongside the parameters, never the mechanism that defines them.

## Considered Options

- **Free-form messages interpreted by n8n/AI**: feels like a "real" chat, but the interpretation layer is unpredictable, errors surface only after the round trip, and the user cannot see or correct the extracted parameters.

## Consequences

- Validation happens in the app (valibot schema per step), so a bad parameter never reaches n8n.
- The parameter list in `docs/api.md` is the single contract between UI and endpoint; adding a parameter touches schema, one chat step, and the doc.
- If free-form interpretation is ever wanted, it arrives as an n8n-side feature reading the optional `prompt` field — no rewrite of the chat.
