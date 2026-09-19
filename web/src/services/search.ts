import type { RepoFile } from "../types";
import { fetchRawMarkdown } from "./github";

export interface SearchResult {
  file: RepoFile;
  category: string;
  matchedField: "name" | "folder" | "content" | "heading";
  snippet?: string;
  headingId?: string;
  headingText?: string;
}

// In-memory cache of note contents for rapid full-text search
const contentIndex = new Map<string, string>();

/**
 * Pre-cache or index note content
 */
export function registerNoteContent(filePath: string, content: string): void {
  contentIndex.set(filePath, content);
}

/**
 * Lazy-load contents for un-indexed markdown files
 */
export async function warmSearchIndex(files: RepoFile[]): Promise<void> {
  const markdownFiles = files.filter((f) => f.type === "markdown");
  // Index up to 30 files in parallel
  const targets = markdownFiles.slice(0, 30);

  await Promise.allSettled(
    targets.map(async (file) => {
      if (!contentIndex.has(file.path)) {
        try {
          const text = await fetchRawMarkdown(file.path);
          contentIndex.set(file.path, text);
        } catch {
          // ignore failures during index warming
        }
      }
    })
  );
}

/**
 * Extract snippet around query with nearest heading anchor
 */
function extractContentSnippet(
  content: string,
  query: string
): { snippet: string; headingId?: string; headingText?: string } | null {
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerContent.indexOf(lowerQuery);

  if (index === -1) return null;

  // Extract text snippet
  const start = Math.max(0, index - 45);
  const end = Math.min(content.length, index + query.length + 65);
  let snippet = content.substring(start, end).replace(/\n+/g, " ").trim();

  if (start > 0) snippet = `...${snippet}`;
  if (end < content.length) snippet = `${snippet}...`;

  // Find nearest preceding heading
  const beforeText = content.substring(0, index);
  const headingMatches = [...beforeText.matchAll(/^(#{1,3})\s+(.+)$/gm)];
  let headingId: string | undefined;
  let headingText: string | undefined;

  if (headingMatches.length > 0) {
    const lastHeading = headingMatches[headingMatches.length - 1];
    headingText = lastHeading[2].replace(/[*_`]/g, "").trim();
    headingId = headingText
      .toLowerCase()
      .replace(/<[^>]*>/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  return { snippet, headingId, headingText };
}

/**
 * Full-text search across filenames, folders, headings, and markdown body content
 */
export async function searchNotesAndContent(
  files: RepoFile[],
  query: string
): Promise<SearchResult[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const results: SearchResult[] = [];
  const matchedPaths = new Set<string>();

  // 1. Filename & Folder Matches
  for (const file of files) {
    const fileNameLower = file.name.toLowerCase();
    const parts = file.path.split("/");
    const category = parts.length > 1 ? parts.slice(0, -1).join(" / ") : "General";
    const pathLower = file.path.toLowerCase();

    if (fileNameLower.includes(cleanQuery)) {
      results.push({ file, category, matchedField: "name" });
      matchedPaths.add(file.path);
    } else if (pathLower.includes(cleanQuery)) {
      results.push({ file, category, matchedField: "folder" });
      matchedPaths.add(file.path);
    }
  }

  // 2. Search inside Markdown body content
  for (const file of files) {
    if (file.type !== "markdown") continue;

    let text = contentIndex.get(file.path);
    if (!text) {
      try {
        text = await fetchRawMarkdown(file.path);
        contentIndex.set(file.path, text);
      } catch {
        continue;
      }
    }

    const match = extractContentSnippet(text, cleanQuery);
    if (match) {
      const parts = file.path.split("/");
      const category = parts.length > 1 ? parts.slice(0, -1).join(" / ") : "General";

      results.push({
        file,
        category,
        matchedField: match.headingText ? "heading" : "content",
        snippet: match.snippet,
        headingId: match.headingId,
        headingText: match.headingText,
      });
      matchedPaths.add(file.path);
    }
  }

  return results.slice(0, 25);
}
