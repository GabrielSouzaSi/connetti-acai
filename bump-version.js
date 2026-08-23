// bump-version.js
const fs = require("fs");
const { execSync } = require("child_process");

const [, , bumpType = "patch"] = process.argv;

const validTypes = ["patch", "minor", "major"];

if (!validTypes.includes(bumpType)) {
  console.error(`Tipo inválido: "${bumpType}". Use patch, minor ou major.`);
  process.exit(1);
}

console.log(`Incrementando versão (${bumpType})...`);
execSync(`npm version ${bumpType} --no-git-tag-version`, { stdio: "inherit" });

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = packageJson.version;

const versionCode = parseInt(version.split(".").join(""));

console.log(`✔️  Versão atualizada para ${version}`);
console.log(`📦 versionCode (Android): ${versionCode}`);
