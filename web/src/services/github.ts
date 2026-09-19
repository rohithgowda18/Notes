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

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

function getFileType(path: string): FileType {
  const lower = path.toLowerCase();
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "markdown";
  if (lower.endsWith(".pdf")) return "pdf";
  return "other";
}

function shouldIgnorePath(path: string): boolean {
  const lower = path.toLowerCase();
  // Ignore git files, web app code, and dotfiles
  if (lower.startsWith(".git") || lower.startsWith(".github") || lower.startsWith("web/")) {
    return true;
  }
  // Ignore node_modules
  if (lower.includes("node_modules/")) {
    return true;
  }
  return false;
}

/**
 * Fetch GitHub repository tree with local storage caching
 */
export async function fetchRepositoryTree(forceRefresh = false): Promise<{
  tree: RepoTree;
  lastSynced: number;
}> {
  if (!forceRefresh) {
    const cachedTree = sessionStorage.getItem(TREE_CACHE_KEY);
    const cachedTimestamp = sessionStorage.getItem(TREE_CACHE_TIMESTAMP_KEY);

    if (cachedTree && cachedTimestamp) {
      try {
        const tree = JSON.parse(cachedTree) as RepoTree;
        return { tree, lastSynced: parseInt(cachedTimestamp, 10) };
      } catch (e) {
        console.warn("Error parsing cached repository tree, fetching fresh", e);
      }
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };

  if (GITHUB_TOKEN) {
    headers["Authorization"] = `token ${GITHUB_TOKEN}`;
  }

  const url = `${GITHUB_API_BASE}/git/trees/${GITHUB_BRANCH}?recursive=1`;

  const response = await fetch(url, { headers });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error(
        "GitHub API rate limit exceeded. Please wait a few minutes or provide a GitHub token."
      );
    }
    if (response.status === 404) {
      throw new Error(
        "GitHub repository or branch not found. Please verify your repository configuration."
      );
    }
    throw new Error(`Failed to fetch repository tree: ${response.statusText}`);
  }

  const data = await response.json();
  const items: GitHubTreeItem[] = data.tree || [];

  const allFiles: RepoFile[] = [];
  const rootFiles: RepoFile[] = [];
  const folderMap = new Map<string, RepoFolder>();

  // Process all items
  for (const item of items) {
    if (item.type !== "blob" || shouldIgnorePath(item.path)) {
      continue;
    }

    const type = getFileType(item.path);
    // Keep markdown and pdfs
    if (type !== "markdown" && type !== "pdf") {
      continue;
    }

    const pathParts = item.path.split("/");
    const name = pathParts[pathParts.length - 1];

    const file: RepoFile = {
      path: item.path,
      name,
      type,
      size: item.size,
      sha: item.sha,
    };

    allFiles.push(file);

    if (pathParts.length === 1) {
      // Root level file
      rootFiles.push(file);
    } else {
      // Nested file inside a category folder
      const folderName = pathParts[0];
      if (!folderMap.has(folderName)) {
        folderMap.set(folderName, {
          name: folderName,
          path: folderName,
          files: [],
          subfolders: [],
        });
      }
      folderMap.get(folderName)!.files.push(file);
    }
  }

  // Sort folders alphabetically
  const folders = Array.from(folderMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
  );

  // Sort files inside each folder
  for (const folder of folders) {
    folder.files.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );
  }

  rootFiles.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
  );

  const tree: RepoTree = {
    folders,
    rootFiles,
    allFiles,
  };

  const now = Date.now();
  sessionStorage.setItem(TREE_CACHE_KEY, JSON.stringify(tree));
  sessionStorage.setItem(TREE_CACHE_TIMESTAMP_KEY, now.toString());

  return { tree, lastSynced: now };
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

  const url = `${GITHUB_RAW_BASE}/${encodeURI(filePath)}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Note not found at path: ${filePath}`);
    }
    throw new Error(`Unable to load note (${response.status} ${response.statusText}).`);
  }

  const content = await response.text();
  sessionStorage.setItem(cacheKey, content);
  return content;
}

/**
 * Clear all cached note contents and repository tree
 */
export function clearStudyCache(): void {
  sessionStorage.removeItem(TREE_CACHE_KEY);
  sessionStorage.removeItem(TREE_CACHE_TIMESTAMP_KEY);

  // Clear note contents
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith(CONTENT_CACHE_PREFIX)) {
      sessionStorage.removeItem(key);
    }
  }
}
