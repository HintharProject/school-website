import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const remote = process.argv.includes("--remote");
const persistTo = process.env.LOCALAPPDATA
  ? join(process.env.LOCALAPPDATA, "hinthar-dev", "wrangler-state")
  : join(root, ".wrangler", "state");
const wrangler = join(root, "node_modules", "wrangler", "bin", "wrangler.js");

const REQUIRED_COLUMNS = [
  ["campuses", "gallery_urls", "ALTER TABLE campuses ADD COLUMN gallery_urls text NOT NULL DEFAULT '[]';"],
  ["campuses", "grades_served_my", "ALTER TABLE campuses ADD COLUMN grades_served_my text;"],
  ["campuses", "facilities_en", "ALTER TABLE campuses ADD COLUMN facilities_en text NOT NULL DEFAULT '[]';"],
  ["campuses", "facilities_my", "ALTER TABLE campuses ADD COLUMN facilities_my text NOT NULL DEFAULT '[]';"],
  ["campuses", "sort_order", "ALTER TABLE campuses ADD COLUMN sort_order integer NOT NULL DEFAULT 0;"],
  ["clubs", "gallery_urls", "ALTER TABLE clubs ADD COLUMN gallery_urls text NOT NULL DEFAULT '[]';"],
  ["clubs", "meeting_time_my", "ALTER TABLE clubs ADD COLUMN meeting_time_my text;"],
  ["clubs", "leadership_my", "ALTER TABLE clubs ADD COLUMN leadership_my text;"],
  ["admissions", "finished_grade", "ALTER TABLE admissions ADD COLUMN finished_grade text;"],
  ["admissions", "suggested_entry_year", "ALTER TABLE admissions ADD COLUMN suggested_entry_year text;"],
  ["admissions", "preferred_region", "ALTER TABLE admissions ADD COLUMN preferred_region text;"],
  ["admissions", "document_urls", "ALTER TABLE admissions ADD COLUMN document_urls text DEFAULT '[]';"],
  ["admissions", "target_program_id", "ALTER TABLE admissions ADD COLUMN target_program_id text;"],
  ["academic_programs", "badge_en", "ALTER TABLE academic_programs ADD COLUMN badge_en text;"],
  ["academic_programs", "badge_my", "ALTER TABLE academic_programs ADD COLUMN badge_my text;"],
  ["academic_programs", "age_range_en", "ALTER TABLE academic_programs ADD COLUMN age_range_en text;"],
  ["academic_programs", "age_range_my", "ALTER TABLE academic_programs ADD COLUMN age_range_my text;"],
  ["academic_programs", "highlights_en", "ALTER TABLE academic_programs ADD COLUMN highlights_en text NOT NULL DEFAULT '[]';"],
  ["academic_programs", "highlights_my", "ALTER TABLE academic_programs ADD COLUMN highlights_my text NOT NULL DEFAULT '[]';"],
  ["academic_programs", "image_url", "ALTER TABLE academic_programs ADD COLUMN image_url text;"],
  ["academic_subjects", "level", "ALTER TABLE academic_subjects ADD COLUMN level text NOT NULL DEFAULT 'Both';"],
  ["yearbook_alumni", "role_my", "ALTER TABLE yearbook_alumni ADD COLUMN role_my text;"],
  ["yearbook_alumni", "quote_my", "ALTER TABLE yearbook_alumni ADD COLUMN quote_my text;"],
  ["yearbook_alumni", "badge_my", "ALTER TABLE yearbook_alumni ADD COLUMN badge_my text;"],
  ["activities", "title_my", "ALTER TABLE activities ADD COLUMN title_my text;"],
  ["activities", "location_my", "ALTER TABLE activities ADD COLUMN location_my text;"],
  ["activities", "description_my", "ALTER TABLE activities ADD COLUMN description_my text;"],
];

const targetFlags = remote ? ["--remote"] : ["--local", "--persist-to", persistTo];

// Fast single-query check of sqlite_master so predev takes ~1.5s when already in sync
const check = spawnSync(
  process.execPath,
  [
    wrangler,
    "d1",
    "execute",
    "hinthar-db",
    ...targetFlags,
    "--json",
    "--command",
    "SELECT name, sql FROM sqlite_master WHERE type='table';",
  ],
  { cwd: root, encoding: "utf8" }
);

const tableSqlMap = new Map();
if (check.status === 0 && check.stdout) {
  try {
    const parsed = JSON.parse(check.stdout);
    const rows = parsed?.[0]?.results ?? [];
    for (const row of rows) {
      if (row.name && row.sql) {
        tableSqlMap.set(String(row.name), String(row.sql));
      }
    }
  } catch {
    // fallback to per-column execution if JSON output varies
  }
}

for (const [table, column, sql] of REQUIRED_COLUMNS) {
  const ddl = tableSqlMap.get(table);
  if (ddl && new RegExp(`[\`"\\s,(]${column}[\`"\\s,)]`, "i").test(ddl)) {
    continue;
  }

  const result = spawnSync(
    process.execPath,
    [wrangler, "d1", "execute", "hinthar-db", ...targetFlags, "--command", sql],
    { cwd: root, encoding: "utf8" }
  );
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.status === 0) {
    console.log(`Added ${table}.${column}`);
    continue;
  }
  if (/duplicate column name/i.test(output)) continue;
  console.error(output || `Failed executing: ${sql}`);
  process.exit(result.status ?? 1);
}

console.log(
  remote
    ? "Verified all schema columns on remote D1."
    : "Verified all schema columns on local D1."
);
