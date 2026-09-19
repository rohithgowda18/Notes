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
const notesTargetDir = path.join(webPublicDir, "notes");

console.log(`[sync-notes] Root Directory: ${rootDir}`);
console.log(`[sync-notes] Notes Target Directory: ${notesTargetDir}`);

// Ensure target directories exist
if (!fs.existsSync(webPublicDir)) {
  fs.mkdirSync(webPublicDir, { recursive: true });
}
if (!fs.existsSync(notesTargetDir)) {
  fs.mkdirSync(notesTargetDir, { recursive: true });
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

function scanAndCopy(sourceDir, relPath = "") {
  if (!fs.existsSync(sourceDir)) return;
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (shouldIgnore(entry.name)) continue;

    const sourcePath = path.join(sourceDir, entry.name);
    const itemRel = (relPath ? `${relPath}/${entry.name}` : entry.name).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      const destDir = path.join(notesTargetDir, itemRel);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      scanAndCopy(sourcePath, itemRel);
    } else if (entry.isFile()) {
      const lower = entry.name.toLowerCase();
      const isDoc = lower.endsWith(".md") || lower.endsWith(".markdown") || lower.endsWith(".pdf");
      const isAsset = lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".svg") || lower.endsWith(".webp") || lower.endsWith(".gif");

      if (isDoc || isAsset) {
        const destPath = path.join(notesTargetDir, itemRel);
        const destFolder = path.dirname(destPath);
        if (!fs.existsSync(destFolder)) {
          fs.mkdirSync(destFolder, { recursive: true });
        }

        // Copy file if changed or not exists
        try {
          fs.copyFileSync(sourcePath, destPath);
        } catch (e) {
          console.warn(`Failed to copy ${itemRel}:`, e.message);
        }

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
}

scanAndCopy(rootDir);

const treeJsonPath = path.join(webPublicDir, "tree.json");
fs.writeFileSync(treeJsonPath, JSON.stringify({ files }, null, 2), "utf-8");

console.log(`[sync-notes] Successfully indexed ${files.length} documents and created tree.json!`);
