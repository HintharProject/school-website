const { ESLint } = require("eslint");
const fs = require("fs");

async function main() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(["app/**/*.tsx", "app/**/*.ts"]);
  
  const formatter = await eslint.loadFormatter("json");
  const resultText = formatter.format(results);
  
  fs.writeFileSync("lint-results.json", resultText);
}

main().catch((error) => {
  fs.writeFileSync("lint-error.txt", String(error));
});
