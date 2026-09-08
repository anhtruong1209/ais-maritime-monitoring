// Concatenates supabase/migrations/*.sql (in filename order) into
// supabase/schema.sql — a single file that can be pasted into the Supabase
// SQL Editor in one shot as an alternative to running the Supabase CLI.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const migrationsDir = join(process.cwd(), "supabase", "migrations");
const outputPath = join(process.cwd(), "supabase", "schema.sql");

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const header = `-- GENERATED FILE. Do not edit directly — edit files under
-- supabase/migrations/ and re-run: node scripts/build-schema.mjs
--
-- This is the full schema for ais-maritime-monitoring, in one file for
-- convenience (paste into Supabase SQL Editor and run once).
`;

const body = files
  .map((file) => {
    const sql = readFileSync(join(migrationsDir, file), "utf8").trimEnd();
    return `-- ===== ${file} =====\n${sql}\n`;
  })
  .join("\n");

writeFileSync(outputPath, `${header}\n${body}`, "utf8");
console.log(`Wrote ${outputPath} from ${files.length} migration file(s).`);
