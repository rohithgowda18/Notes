import type { RepoFile, RepoFolder, RepoTree } from "../types";
import defaultLeetcodeData from "../../public/leetcode-tree.json";
import {
  LEETCODE_API_BASE,
  LEETCODE_BRANCH,
  LEETCODE_RAW_BASE,
} from "../config/github";
import { getStoredGitHubToken } from "./github";

const LC_TREE_CACHE_KEY = "leetcode_tree_cache";
const LC_TREE_CACHE_TS_KEY = "leetcode_tree_timestamp";
const LC_CONTENT_CACHE_PREFIX = "leetcode_content_";


function getFileType(path: string): "markdown" | "pdf" | "other" {
  const lower = path.toLowerCase();
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "markdown";
  if (lower.endsWith(".pdf")) return "pdf";
  return "other";
}

interface FolderBuilderNode {
  name: string;
  path: string;
  files: RepoFile[];
  subfolderMap: Map<string, FolderBuilderNode>;
}

function buildTreeFromItems(
  items: Array<{ path: string; name?: string; type?: string; size?: number }>
): RepoTree {
  const allFiles: RepoFile[] = [];
  const rootFiles: RepoFile[] = [];
  const rootFolderMap = new Map<string, FolderBuilderNode>();
  const seenPaths = new Set<string>();

  for (const item of items) {
    if (!item.path) continue;
    const normalizedPath = item.path
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")
      .replace(/\/+$/, "");

    const type = getFileType(normalizedPath);
    if (type !== "markdown" && type !== "pdf") continue;
    if (seenPaths.has(normalizedPath)) continue;
    seenPaths.add(normalizedPath);

    const pathParts = normalizedPath.split("/");
    const fileName = item.name || pathParts[pathParts.length - 1];

    const file: RepoFile = {
      path: normalizedPath,
      name: fileName,
      type,
      size: item.size,
    };

    allFiles.push(file);

    if (pathParts.length === 1) {
      rootFiles.push(file);
    } else {
      let currentMap = rootFolderMap;
      let currentPath = "";

      for (let i = 0; i < pathParts.length - 1; i++) {
        const folderName = pathParts[i];
        currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

        if (!currentMap.has(folderName)) {
          currentMap.set(folderName, {
            name: folderName,
            path: currentPath,
            files: [],
            subfolderMap: new Map(),
          });
        }

        const folderNode = currentMap.get(folderName)!;
        if (i === pathParts.length - 2) {
          folderNode.files.push(file);
        } else {
          currentMap = folderNode.subfolderMap;
        }
      }
    }
  }

  function convertToRepoFolder(node: FolderBuilderNode): RepoFolder {
    const subfolders = Array.from(node.subfolderMap.values())
      .map(convertToRepoFolder)
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
      );

    const files = node.files.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );

    return { name: node.name, path: node.path, files, subfolders };
  }

  const folders = Array.from(rootFolderMap.values())
    .map(convertToRepoFolder)
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );

  rootFiles.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
  );

  allFiles.sort((a, b) =>
    a.path.localeCompare(b.path, undefined, { numeric: true, sensitivity: "base" })
  );

  return { folders, rootFiles, allFiles };
}

/**
 * Fetch the LeetCode solutions tree directly from GitHub with local fallbacks
 */
export async function fetchLeetcodeTree(forceRefresh = false): Promise<{
  tree: RepoTree;
  lastSynced: number;
}> {
  if (!forceRefresh) {
    const cachedTree = sessionStorage.getItem(LC_TREE_CACHE_KEY);
    const cachedTs = sessionStorage.getItem(LC_TREE_CACHE_TS_KEY);
    if (cachedTree && cachedTs) {
      try {
        const tree = JSON.parse(cachedTree) as RepoTree;
        if (tree.allFiles && tree.allFiles.length > 0) {
          return { tree, lastSynced: parseInt(cachedTs, 10) };
        }
      } catch {
        // re-fetch
      }
    }
  }

  // 1. Try fetching directly from GitHub API (Leetcode-Solutions repo)
  const token = getStoredGitHubToken();
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  const url = `${LEETCODE_API_BASE}/git/trees/${LEETCODE_BRANCH}?recursive=1`;
  try {
    const response = await fetch(url, { headers });
    if (response.ok) {
      const data = await response.json();
      const items = (data.tree || []).filter((item: any) => {
        const p = item.path.toLowerCase();
        return p.startsWith("dsa/") || p.startsWith("database/");
      });
      if (items.length > 0) {
        const tree = buildTreeFromItems(items);
        const now = Date.now();
        sessionStorage.setItem(LC_TREE_CACHE_KEY, JSON.stringify(tree));
        sessionStorage.setItem(LC_TREE_CACHE_TS_KEY, now.toString());
        return { tree, lastSynced: now };
      }
    }
  } catch (e) {
    console.warn("Direct GitHub fetch for LeetCode tree failed, trying fallback", e);
  }

  // 2. Try static leetcode-tree.json
  try {
    const res = await fetch(`/leetcode-tree.json?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        const tree = buildTreeFromItems(data.files);
        const now = Date.now();
        sessionStorage.setItem(LC_TREE_CACHE_KEY, JSON.stringify(tree));
        sessionStorage.setItem(LC_TREE_CACHE_TS_KEY, now.toString());
        return { tree, lastSynced: now };
      }
    }
  } catch {
    // fall through
  }

  // 3. Fallback to pre-bundled data from repository
  if (defaultLeetcodeData?.files && defaultLeetcodeData.files.length > 0) {
    const tree = buildTreeFromItems(defaultLeetcodeData.files as any);
    return { tree, lastSynced: Date.now() };
  }

  return {
    tree: { folders: [], rootFiles: [], allFiles: [] },
    lastSynced: Date.now(),
  };
}

/**
 * Fetch raw markdown content for a LeetCode solution directly from GitHub
 */
export async function fetchLeetcodeMarkdown(
  filePath: string,
  forceRefresh = false
): Promise<string> {
  const cacheKey = `${LC_CONTENT_CACHE_PREFIX}${filePath}`;

  if (!forceRefresh) {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return cached;
  }

  // 1. Fetch directly from GitHub raw URL (Option B)
  const token = getStoredGitHubToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  const rawUrl = `${LEETCODE_RAW_BASE}/${encodeURI(filePath)}`;
  try {
    const response = await fetch(rawUrl, { headers });
    if (response.ok) {
      const content = await response.text();
      sessionStorage.setItem(cacheKey, content);
      return content;
    }
  } catch (e) {
    console.warn("Direct GitHub raw fetch failed for LeetCode solution", e);
  }

  throw new Error(`Unable to load LeetCode solution: ${filePath}`);
}

/**
 * Clear LeetCode caches
 */
export function clearLeetcodeCache(): void {
  sessionStorage.removeItem(LC_TREE_CACHE_KEY);
  sessionStorage.removeItem(LC_TREE_CACHE_TS_KEY);
  const keysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(LC_CONTENT_CACHE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => sessionStorage.removeItem(k));
}
