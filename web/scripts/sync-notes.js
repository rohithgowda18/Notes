import fs from "node:fs";
import path from "node:path";

// Find root repository directory containing study notes folders
const currentDir = import.meta.dirname || path.resolve(".");
let rootDir = path.resolve(currentDir, "../..");
if (!fs.existsSync(path.join(rootDir, "01-Operating-Systems"))) {
  rootDir = path.resolve(currentDir, "..");
}
if (!fs.existsSync(path.join(rootDir, "01-Operating-Systems"))) {
  rootDir = path.resolve(".");
}

const webPublicDir = path.resolve(rootDir, "web", "public");

console.log(`[sync-notes] Root Directory: ${rootDir}`);
console.log(`[sync-notes] Web Public Directory: ${webPublicDir}`);

// Ensure public directory exists
if (!fs.existsSync(webPublicDir)) {
  fs.mkdirSync(webPublicDir, { recursive: true });
}

const files = [];

function shouldIgnore(name) {
  return (
    name.startsWith(".") ||
    name === "node_modules" ||
    name === "web" ||
    name === "dist" ||
    name === ".git"
  );
}

function scan(sourceDir, relPath = "") {
  if (!fs.existsSync(sourceDir)) return;
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (shouldIgnore(entry.name)) continue;

    const sourcePath = path.join(sourceDir, entry.name);
    const itemRel = (relPath ? `${relPath}/${entry.name}` : entry.name).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      scan(sourcePath, itemRel);
    } else if (entry.isFile()) {
      const lower = entry.name.toLowerCase();
      const isDoc = lower.endsWith(".md") || lower.endsWith(".markdown") || lower.endsWith(".pdf");

      if (isDoc) {
        files.push({
          path: itemRel,
          name: entry.name,
          type: lower.endsWith(".pdf") ? "pdf" : "markdown",
          size: fs.statSync(sourcePath).size,
        });
      }
    }
  }
}

scan(rootDir);

const treeJsonPath = path.join(webPublicDir, "tree.json");
fs.writeFileSync(treeJsonPath, JSON.stringify({ files }, null, 2), "utf-8");

console.log(`[sync-notes] Successfully indexed ${files.length} documents into tree.json! (No local copies generated)`);
