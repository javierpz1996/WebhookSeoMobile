# Feature-first layout with one-way import zones

The app is organized by feature (`chat`, `articles`, `context`) over three shared layers (`core`, `data`, `ui`) with a single composition root in `src/app`, and ESLint enforces that imports only flow one way: features → core/data/ui, `core` imports nothing, `data` implements the ports that `core` declares.

## Considered Options

- **Layer-first (`src/ui`, `src/services`, `src/types` grouped by file type)**: looks simpler with two screens, but becomes the classic dumping-ground `services/` folder as features grow, and has no boundary to lint against.
- **Feature-first with zones**: costs a little more structure up front, but each new screen lands in a predictable folder and boundary violations fail the lint gate.

## Consequences

- Business logic lives in features and `core`; React Native and I/O never leak into `core`.
- Ports (interfaces) are declared pure and implemented in `src/data/`, wired once in the composition root — this is what makes the database and API layers swappable.
- Adding a feature must not require editing another feature's folder.
