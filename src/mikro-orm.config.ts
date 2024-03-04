import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator, TSMigrationGenerator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/core';
import { SeedManager } from '@mikro-orm/seeder';
import * as path from 'path';
import { format } from 'sql-formatter';
import prettier from '@prettier/sync';

class PrettifiedTsMigrationGenerator extends TSMigrationGenerator {
  generateMigrationFile(
    className: string,
    diff: { up: string[]; down: string[] },
  ): string {
    return prettier.format(super.generateMigrationFile(className, diff), {
      ...prettier.resolveConfig(__dirname),
      parser: 'typescript',
    });
  }

  createStatement(sql: string, padLeft: number): string {
    if (sql) {
      sql = format(sql, { language: 'postgresql' });
      // a bit of indenting magic
      sql = sql
        .split('\n')
        .map((l, i) => (i === 0 ? l : `${' '.repeat(padLeft + 13)}${l}`))
        .join('\n');

      const padding = ' '.repeat(padLeft);
      return `${padding}this.addSql(\`${sql}\`);\n`;
    }

    return '\n';
  }
}

export default defineConfig({
  driver: PostgreSqlDriver,
  clientUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/nest',
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  discovery: {
    warnWhenNoEntities: false,
  },
  extensions: [Migrator, SeedManager],
  migrations: {
    path: path.join(__dirname, './migrations'),
    fileName: (timestamp: string, name?: string) => {
      if (!name) {
        throw new Error(
          'Specify migration name via `mikro-orm migration:create --name=...`',
        );
      }

      return `Migration${timestamp}_${name}`;
    },
    generator: PrettifiedTsMigrationGenerator,
  },
  seeder: {
    path: path.join(__dirname, './seeds'),
  },
});
