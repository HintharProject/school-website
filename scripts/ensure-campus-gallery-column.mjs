import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const remote = process.argv.includes("--remote");
const persistTo = process.env.LOCALAPPDATA
  ? join(process.env.LOCALAPPDATA, "hinthar-dev", "wrangler-state")
  : join(root, ".wrangler", "state");
const wrangler = join(root, "node_modules", "wrangler", "bin", "wrangler.js");

const alterSql =
  "ALTER TABLE campuses ADD COLUMN gallery_urls text NOT NULL DEFAULT '[]';";

const args = [
  wrangler,
  "d1",
  "execute",
  "hinthar-db",
  ...(remote ? ["--remote"] : ["--local", "--persist-to", persistTo]),
  "--command",
  alterSql,
];

const result = spawnSync(process.execPath, args, {
  cwd: root,
  encoding: "utf8",
});

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

if (result.status === 0) {
  console.log(
    remote
      ? "Added campuses.gallery_urls on remote D1."
      : "Added campuses.gallery_urls on local D1."
  );
  process.exit(0);
}

if (/duplicate column name:\s*gallery_urls/i.test(output)) {
  console.log("campuses.gallery_urls already exists — skipped.");
  process.exit(0);
}

console.error(output || "Failed to ensure campuses.gallery_urls column.");
process.exit(result.status ?? 1);
