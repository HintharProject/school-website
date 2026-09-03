import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = join(root, "node_modules", "wrangler", "bin", "wrangler.js");
const node = process.execPath;

function run(label, args) {
  const result = spawnSync(node, args, { cwd: root, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    console.error(`${label} failed with exit code ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

run("db:migrate:prod", [
  wrangler,
  "d1",
  "migrations",
  "apply",
  "hinthar-db",
  "--remote",
]);

run("ensure-campus-gallery-column", [
  join(root, "scripts", "ensure-campus-gallery-column.mjs"),
  "--remote",
]);
