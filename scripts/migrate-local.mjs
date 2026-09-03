import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const persistTo = process.env.LOCALAPPDATA
  ? join(process.env.LOCALAPPDATA, "hinthar-dev", "wrangler-state")
  : join(root, ".wrangler", "state");
const wrangler = join(root, "node_modules", "wrangler", "bin", "wrangler.js");

const result = spawnSync(
  process.execPath,
  [wrangler, "d1", "migrations", "apply", "hinthar-db", "--local", "--persist-to", persistTo],
  { cwd: root, stdio: "inherit" }
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
