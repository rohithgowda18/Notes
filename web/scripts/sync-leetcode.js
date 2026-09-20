import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const currentDir = import.meta.dirname || path.resolve(".");
let rootDir = path.resolve(currentDir, "../..");
if (!fs.existsSync(path.join(rootDir, "web"))) {
  rootDir = path.resolve(currentDir, "..");
}

const webPublicDir = path.resolve(rootDir, "web", "public");
const leetcodeTargetDir = path.join(webPublicDir, "leetcode");

console.log(`[sync-leetcode] Root Directory: ${rootDir}`);
console.log(`[sync-leetcode] LeetCode Target Directory: ${leetcodeTargetDir}`);

// Ensure target directory exists
if (!fs.existsSync(leetcodeTargetDir)) {
  fs.mkdirSync(leetcodeTargetDir, { recursive: true });
}

// Determine source: local path or clone from GitHub
const LEETCODE_REPO = "https://github.com/rohithgowda18/Leetcode-Solutions.git";
const LEETCODE_BRANCH = "main";
let leetcodeSourceDir = process.env.LEETCODE_LOCAL_PATH || "";

// Check if there's a local clone we can use (for dev convenience)
if (!leetcodeSourceDir) {
  const localPaths = [
    path.resolve(rootDir, "..", "leetcode-solution-organizer"),
    path.resolve(rootDir, "..", "Leetcode-Solutions"),
  ];
  for (const p of localPaths) {
    if (fs.existsSync(path.join(p, "dsa")) || fs.existsSync(path.join(p, "database"))) {
      leetcodeSourceDir = p;
      console.log(`[sync-leetcode] Found local LeetCode repo at: ${leetcodeSourceDir}`);
      break;
    }
  }
}

// If no local source, clone from GitHub into a temp directory
const tempCloneDir = path.join(rootDir, ".leetcode-clone-tmp");
if (!leetcodeSourceDir) {
  console.log(`[sync-leetcode] Cloning ${LEETCODE_REPO} (branch: ${LEETCODE_BRANCH})...`);

  if (fs.existsSync(tempCloneDir)) {
    fs.rmSync(tempCloneDir, { recursive: true, force: true });
  }

  try {
    const token = process.env.GITHUB_TOKEN || "";
    let cloneUrl = LEETCODE_REPO;
    if (token) {
      cloneUrl = `https://${token}@github.com/rohithgowda18/Leetcode-Solutions.git`;
    }
    execSync(
      `git clone --depth 1 --branch ${LEETCODE_BRANCH} ${cloneUrl} "${tempCloneDir}"`,
      { stdio: "pipe", timeout: 60000 }
    );
    leetcodeSourceDir = tempCloneDir;
    console.log(`[sync-leetcode] Clone successful.`);
  } catch (err) {
    console.warn(`[sync-leetcode] Clone failed: ${err.message}`);
    console.warn(`[sync-leetcode] Skipping LeetCode sync. Set LEETCODE_LOCAL_PATH env var for local dev.`);

    const treeJsonPath = path.join(webPublicDir, "leetcode-tree.json");
    fs.writeFileSync(treeJsonPath, JSON.stringify({ files: [] }, null, 2), "utf-8");
    console.log(`[sync-leetcode] Created empty leetcode-tree.json`);
    process.exit(0);
  }
}

const files = [];

function scanAndCopy(sourceDir, relPath = "") {
  if (!fs.existsSync(sourceDir)) return;
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (
      entry.name.startsWith(".") ||
      entry.name === "node_modules" ||
      entry.name === "src" ||
      entry.name === "server" ||
      entry.name === "scripts" ||
      entry.name === "data" ||
      entry.name === "dist" ||
      entry.name === "public"
    ) {
      continue;
    }

    const sourcePath = path.join(sourceDir, entry.name);
    const itemRel = (relPath ? `${relPath}/${entry.name}` : entry.name).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      if (!relPath && entry.name !== "dsa" && entry.name !== "database") {
        continue;
      }
      const destDir = path.join(leetcodeTargetDir, itemRel);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      scanAndCopy(sourcePath, itemRel);
    } else if (entry.isFile()) {
      const lower = entry.name.toLowerCase();
      if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
        const destPath = path.join(leetcodeTargetDir, itemRel);
        const destFolder = path.dirname(destPath);
        if (!fs.existsSync(destFolder)) {
          fs.mkdirSync(destFolder, { recursive: true });
        }

        try {
          fs.copyFileSync(sourcePath, destPath);
        } catch (e) {
          console.warn(`[sync-leetcode] Failed to copy ${itemRel}:`, e.message);
        }

        files.push({
          path: itemRel,
          name: entry.name,
          type: "markdown",
          size: fs.statSync(sourcePath).size,
        });
      }
    }
  }
}

scanAndCopy(leetcodeSourceDir);

const treeJsonPath = path.join(webPublicDir, "leetcode-tree.json");
fs.writeFileSync(treeJsonPath, JSON.stringify({ files }, null, 2), "utf-8");

console.log(`[sync-leetcode] Successfully indexed ${files.length} LeetCode solutions and created leetcode-tree.json!`);

// Clean up temp clone
if (fs.existsSync(tempCloneDir)) {
  try {
    fs.rmSync(tempCloneDir, { recursive: true, force: true });
    console.log(`[sync-leetcode] Cleaned up temp clone.`);
  } catch {
    // Ignore cleanup errors
  }
}
