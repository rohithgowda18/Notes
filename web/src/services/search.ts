import type { RepoFile } from "../types";

export interface SearchResult {
  file: RepoFile;
  category: string;
  matchedField: "name" | "folder" | "path";
}

/**
 * Client-side search across files and folder categories
 */
export function searchFiles(files: RepoFile[], query: string): SearchResult[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const results: SearchResult[] = [];

  for (const file of files) {
    const fileNameLower = file.name.toLowerCase();
    const filePathLower = file.path.toLowerCase();
    const parts = file.path.split("/");
    const category = parts.length > 1 ? parts[0] : "Root";
    const categoryLower = category.toLowerCase();

    if (fileNameLower.includes(cleanQuery)) {
      results.push({ file, category, matchedField: "name" });
    } else if (categoryLower.includes(cleanQuery)) {
      results.push({ file, category, matchedField: "folder" });
    } else if (filePathLower.includes(cleanQuery)) {
      results.push({ file, category, matchedField: "path" });
    }
  }

  // Prioritize exact filename matches first
  return results.sort((a, b) => {
    const aNameStarts = a.file.name.toLowerCase().startsWith(cleanQuery);
    const bNameStarts = b.file.name.toLowerCase().startsWith(cleanQuery);
    if (aNameStarts && !bNameStarts) return -1;
    if (!aNameStarts && bNameStarts) return 1;
    return 0;
  });
}
