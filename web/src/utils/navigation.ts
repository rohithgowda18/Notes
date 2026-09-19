import type { RepoFile } from "../types";

/**
 * Finds the best target route to navigate to when a folder is clicked.
 * Priority:
 * 1. README.md or Readme.md inside this folder
 * 2. First direct Markdown file in this folder
 * 3. Any direct file (e.g. PDF) in this folder
 * 4. Any file recursively inside this folder
 * 5. Fallback to /note/README.md
 */
export function getFolderTargetRoute(folderPath: string, allFiles: RepoFile[]): string {
  if (!folderPath) return "/note/README.md";

  const cleanFolderPath = folderPath.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");
  const lowerFolder = cleanFolderPath.toLowerCase();
  const folderDepth = cleanFolderPath.split("/").length;

  // 1. Check for README.md directly in this folder
  const readme = allFiles.find((f) => {
    const fLower = f.path.toLowerCase();
    return (
      fLower === `${lowerFolder}/readme.md` ||
      fLower === `${lowerFolder}/readme.markdown`
    );
  });
  if (readme) {
    return `/note/${encodeURIComponent(readme.path)}`;
  }

  // 2. Check for first direct Markdown file in this folder
  const directMd = allFiles.find((f) => {
    const fLower = f.path.toLowerCase();
    const parts = f.path.split("/");
    return (
      f.type === "markdown" &&
      fLower.startsWith(`${lowerFolder}/`) &&
      parts.length === folderDepth + 1
    );
  });
  if (directMd) {
    return `/note/${encodeURIComponent(directMd.path)}`;
  }

  // 3. Check for any direct file (e.g. PDF) in this folder
  const directFile = allFiles.find((f) => {
    const fLower = f.path.toLowerCase();
    const parts = f.path.split("/");
    return fLower.startsWith(`${lowerFolder}/`) && parts.length === folderDepth + 1;
  });
  if (directFile) {
    return directFile.type === "pdf"
      ? `/pdf/${encodeURIComponent(directFile.path)}`
      : `/note/${encodeURIComponent(directFile.path)}`;
  }

  // 4. Any file in this folder hierarchy
  const anyFile = allFiles.find((f) => f.path.toLowerCase().startsWith(`${lowerFolder}/`));
  if (anyFile) {
    return anyFile.type === "pdf"
      ? `/pdf/${encodeURIComponent(anyFile.path)}`
      : `/note/${encodeURIComponent(anyFile.path)}`;
  }

  return "/note/README.md";
}

/**
 * Gets the parent directory of a file or folder path.
 */
export function getParentFolderPath(filePath: string): string | null {
  if (!filePath) return null;
  const parts = filePath.replace(/\\/g, "/").split("/");
  if (parts.length <= 1) return null;
  return parts.slice(0, -1).join("/");
}
