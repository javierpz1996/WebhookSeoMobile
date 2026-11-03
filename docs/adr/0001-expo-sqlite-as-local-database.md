# expo-sqlite as the local database, behind a repository port

The app must persist Articles and Context "simulating a database" and someday swap to a real one. We chose expo-sqlite (included in Expo Go, so no native build) over AsyncStorage/JSON blobs and MMKV, and we reach it only through a `SqlDriver` port plus validated repositories returning typed `Result`s, so replacing the engine later means writing one adapter.

## Considered Options

- **AsyncStorage/JSON**: fastest MVP, but full-blob rewrites, no queries, no integrity; the "swap later" cost is the same repository rewrite, without ever having had real queries.
- **MMKV**: fastest runtime, but requires a dev build — incompatible with the Expo Go-first decision.
- **expo-sqlite**: real queries, STRICT tables, forward-only migrations; costs more bootstrap code, which the installed `persistence-and-migrations` skill already prescribes.

## Consequences

- All SQL lives in `src/data/`; features never touch the driver (enforced by import zones).
- Schema changes go through frozen forward-only migrations; shipped steps are never edited.
- A damaged or newer database must never crash-loop the app at startup.
