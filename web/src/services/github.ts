import {
  GITHUB_API_BASE,
  GITHUB_BRANCH,
  GITHUB_RAW_BASE,
  GITHUB_TOKEN,
} from "../config/github";
import type { FileType, RepoFile, RepoFolder, RepoTree } from "../types";

const TREE_CACHE_KEY = "study_notes_tree_cache";
const TREE_CACHE_TIMESTAMP_KEY = "study_notes_tree_timestamp";
const CONTENT_CACHE_PREFIX = "study_note_content_";
const TOKEN_STORAGE_KEY = "study_notes_github_token";
const FALLBACK_MODE_KEY = "study_notes_local_fallback";

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha?: string;
  size?: number;
  url?: string;
}

export function getStoredGitHubToken(): string {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || GITHUB_TOKEN || "";
}

export function setStoredGitHubToken(token: string): void {
  if (token.trim()) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token.trim());
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function isLocalFallbackActive(): boolean {
  return sessionStorage.getItem(FALLBACK_MODE_KEY) === "true";
}

function getFileType(path: string): FileType {
  const lower = path.toLowerCase();
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "markdown";
  if (lower.endsWith(".pdf")) return "pdf";
  return "other";
}

function shouldIgnorePath(path: string): boolean {
  const lower = path.toLowerCase();
  if (lower.startsWith(".git") || lower.startsWith(".github") || lower.startsWith("web/")) {
    return true;
  }
  if (lower.includes("node_modules/")) {
    return true;
  }
  return false;
}

interface FolderBuilderNode {
  name: string;
  path: string;
  files: RepoFile[];
  subfolderMap: Map<string, FolderBuilderNode>;
}

function buildTreeFromItems(items: Array<{ path: string; name?: string; type?: string; size?: number }>): RepoTree {
  const allFiles: RepoFile[] = [];
  const rootFiles: RepoFile[] = [];
  const rootFolderMap = new Map<string, FolderBuilderNode>();
  const seenPaths = new Set<string>();

  for (const item of items) {
    if (!item.path) continue;
    const normalizedPath = item.path.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");

    if (shouldIgnorePath(normalizedPath)) {
      continue;
    }

    const type = getFileType(normalizedPath);
    if (type !== "markdown" && type !== "pdf") {
      continue;
    }

    if (seenPaths.has(normalizedPath)) {
      continue;
    }
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

  // Convert builder nodes to RepoFolder recursively with natural sorting
  function convertToRepoFolder(node: FolderBuilderNode): RepoFolder {
    const subfolders = Array.from(node.subfolderMap.values())
      .map(convertToRepoFolder)
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
      );

    const files = node.files.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );

    return {
      name: node.name,
      path: node.path,
      files,
      subfolders,
    };
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
 * Fetch GitHub repository tree with local storage caching and dev fallback
 */
export async function fetchRepositoryTree(forceRefresh = false): Promise<{
  tree: RepoTree;
  lastSynced: number;
  isLocal: boolean;
}> {
  if (!forceRefresh) {
    const cachedTree = sessionStorage.getItem(TREE_CACHE_KEY);
    const cachedTimestamp = sessionStorage.getItem(TREE_CACHE_TIMESTAMP_KEY);

    if (cachedTree && cachedTimestamp) {
      try {
        const tree = JSON.parse(cachedTree) as RepoTree;
        return {
          tree,
          lastSynced: parseInt(cachedTimestamp, 10),
          isLocal: isLocalFallbackActive(),
        };
      } catch (e) {
        console.warn("Error parsing cached repository tree, fetching fresh", e);
      }
    }
  }

  // 1. Try static tree.json first (baked into build for zero-config Vercel deployment)
  try {
    const staticRes = await fetch("/tree.json");
    if (staticRes.ok) {
      const staticData = await staticRes.json();
      if (staticData.files && staticData.files.length > 0) {
        const tree = buildTreeFromItems(staticData.files);
        const now = Date.now();
        sessionStorage.setItem(TREE_CACHE_KEY, JSON.stringify(tree));
        sessionStorage.setItem(TREE_CACHE_TIMESTAMP_KEY, now.toString());
        sessionStorage.setItem(FALLBACK_MODE_KEY, "true");
        return { tree, lastSynced: now, isLocal: true };
      }
    }
  } catch {
    // Continue to dev endpoint or GitHub
  }

  // 2. Try local dev endpoint if on dev server
  if (import.meta.env.DEV) {
    try {
      const localRes = await fetch("/api/local-tree");
      if (localRes.ok) {
        const localData = await localRes.json();
        const tree = buildTreeFromItems(localData.files || []);
        const now = Date.now();
        sessionStorage.setItem(TREE_CACHE_KEY, JSON.stringify(tree));
        sessionStorage.setItem(TREE_CACHE_TIMESTAMP_KEY, now.toString());
        sessionStorage.setItem(FALLBACK_MODE_KEY, "true");
        return { tree, lastSynced: now, isLocal: true };
      }
    } catch {
      // Continue to GitHub API
    }
  }

  const token = getStoredGitHubToken();
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  const url = `${GITHUB_API_BASE}/git/trees/${GITHUB_BRANCH}?recursive=1`;

  try {
    const response = await fetch(url, { headers });

    if (response.ok) {
      const data = await response.json();
      const items: GitHubTreeItem[] = data.tree || [];
      const tree = buildTreeFromItems(items);

      const now = Date.now();
      sessionStorage.setItem(TREE_CACHE_KEY, JSON.stringify(tree));
      sessionStorage.setItem(TREE_CACHE_TIMESTAMP_KEY, now.toString());
      sessionStorage.setItem(FALLBACK_MODE_KEY, "false");

      return { tree, lastSynced: now, isLocal: false };
    }

    if (response.status === 403) {
      throw new Error("GitHub API rate limit exceeded. Please provide a GitHub Personal Access Token.");
    }
    if (response.status === 404) {
      throw new Error("GitHub repository or branch not found. If this repository is private, please provide a GitHub token.");
    }
    throw new Error(`Failed to fetch repository tree: ${response.statusText}`);
  } catch (err: any) {
    throw err;
  }
}

/**
 * Fetch raw markdown content for a specific file
 */
export async function fetchRawMarkdown(filePath: string, forceRefresh = false): Promise<string> {
  const cacheKey = `${CONTENT_CACHE_PREFIX}${filePath}`;

  if (!forceRefresh) {
    const cachedContent = sessionStorage.getItem(cacheKey);
    if (cachedContent) {
      return cachedContent;
    }
  }

  // 1. Try static /notes/ path first (Vercel CDN deployment)
  try {
    const staticRes = await fetch(`/notes/${encodeURI(filePath)}`);
    if (staticRes.ok) {
      const text = await staticRes.text();
      if (!text.trim().startsWith("<!DOCTYPE html") && !text.trim().startsWith("<html")) {
        sessionStorage.setItem(cacheKey, text);
        return text;
      }
    }
  } catch {
    // Continue
  }

  // 2. In local dev server, read directly from local workspace
  if (import.meta.env.DEV || isLocalFallbackActive()) {
    try {
      const localRes = await fetch(`/api/local-file?path=${encodeURIComponent(filePath)}`);
      if (localRes.ok) {
        const text = await localRes.text();
        sessionStorage.setItem(cacheKey, text);
        return text;
      }
    } catch {
      // Continue to GitHub fetch
    }
  }

  const token = getStoredGitHubToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  const url = `${GITHUB_RAW_BASE}/${encodeURI(filePath)}`;
  try {
    const response = await fetch(url, { headers });
    if (response.ok) {
      const content = await response.text();
      sessionStorage.setItem(cacheKey, content);
      return content;
    }
  } catch (e) {
    console.warn("Raw GitHub fetch failed", e);
  }

  // Fallback to local server if on dev
  const fallbackRes = await fetch(`/api/local-file?path=${encodeURIComponent(filePath)}`);
  if (fallbackRes.ok) {
    const text = await fallbackRes.text();
    sessionStorage.setItem(cacheKey, text);
    return text;
  }

  throw new Error(`Unable to load note from path: ${filePath}`);
}

/**
 * Clear all cached note contents and repository tree
 */
export function clearStudyCache(): void {
  sessionStorage.removeItem(TREE_CACHE_KEY);
  sessionStorage.removeItem(TREE_CACHE_TIMESTAMP_KEY);

  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith(CONTENT_CACHE_PREFIX)) {
      sessionStorage.removeItem(key);
    }
  }
}
