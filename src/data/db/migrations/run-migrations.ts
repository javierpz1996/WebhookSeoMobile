import { BASELINE_SCHEMA_VERSION } from '@/core/constants';
import type { DbError } from '@/core/types/db-error';
import type { SqlDriver } from '@/core/ports/sql-driver';
import { err, ok, type Result } from '@/core/utils/result';

import { MIGRATION_V0001_BASELINE } from '@/data/db/migrations/v0001-baseline';
import { MIGRATION_V0002_CHAT_SESSIONS } from '@/data/db/migrations/v0002-chat-sessions';

function splitStatements(sql: string): readonly string[] {
  return sql
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

type MigrationStep = {
  readonly version: number;
  readonly sql: string;
};

const MIGRATIONS: readonly MigrationStep[] = [
  { version: MIGRATION_V0001_BASELINE.version, sql: MIGRATION_V0001_BASELINE.sql },
  { version: MIGRATION_V0002_CHAT_SESSIONS.version, sql: MIGRATION_V0002_CHAT_SESSIONS.sql },
];

function applyMigration(driver: SqlDriver, step: MigrationStep): Result<void, DbError> {
  return driver.withTransaction(() => {
    for (const statement of splitStatements(step.sql)) {
      const runResult = driver.run(statement);
      if (!runResult.ok) {
        return runResult;
      }
    }
    const stamp = driver.setUserVersion(step.version);
    if (!stamp.ok) {
      return stamp;
    }
    return ok(undefined);
  });
}

export function runMigrations(driver: SqlDriver): Result<number, DbError> {
  const versionResult = driver.getUserVersion();
  if (!versionResult.ok) {
    return versionResult;
  }

  let version = versionResult.value;
  if (version >= BASELINE_SCHEMA_VERSION) {
    return ok(version);
  }

  for (const step of MIGRATIONS) {
    if (version >= step.version) {
      continue;
    }
    if (version !== step.version - 1) {
      return err({
        kind: 'unknown',
        message: `unsupported schema version ${String(version)}`,
      });
    }
    const migrateResult = applyMigration(driver, step);
    if (!migrateResult.ok) {
      return migrateResult;
    }
    version = step.version;
  }

  if (version !== BASELINE_SCHEMA_VERSION) {
    return err({
      kind: 'unknown',
      message: `unsupported schema version ${String(version)}`,
    });
  }

  return ok(version);
}
