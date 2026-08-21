import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFile = path.resolve(
  __dirname,
  "../node_modules/miniflare/dist/src/workers/d1/database.worker.js"
);

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, "utf8");
  let modified = false;

  // Safe bookmark handling in Miniflare D1 worker
  const oldBookmark = `[D1_SESSION_COMMIT_TOKEN_HTTP_HEADER]: await this.state.storage.getCurrentBookmark()`;
  if (content.includes(oldBookmark)) {
    const newBookmark = `[D1_SESSION_COMMIT_TOKEN_HTTP_HEADER]: (typeof this.state.storage?.getCurrentBookmark === "function" ? await this.state.storage.getCurrentBookmark().catch?.(() => undefined) : undefined)`;
    content = content.replace(oldBookmark, newBookmark);
    modified = true;
  }

  // Ensure query mapping and last_row_id are properly bound
  const oldQueryBlock = `let cursor = this.state.storage.sql.exec(query.sql, ...params);`;
  if (content.includes(oldQueryBlock)) {
    content = content.replace(
      oldQueryBlock,
      `let cursor = this.db.prepare(query.sql)(...params);`
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(targetFile, content, "utf8");
    console.log("Successfully verified and patched Miniflare D1 database.worker.js");
  } else {
    console.log("Miniflare D1 worker is already in expected configuration.");
  }
}
