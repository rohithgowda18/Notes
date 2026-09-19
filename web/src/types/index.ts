export type FileType = "markdown" | "pdf" | "other";

export interface RepoFile {
  path: string;
  name: string;
  type: FileType;
  size?: number;
  sha?: string;
}

export interface RepoFolder {
  name: string;
  path: string;
  files: RepoFile[];
  subfolders: RepoFolder[];
}

export interface RepoTree {
  folders: RepoFolder[];
  rootFiles: RepoFile[];
  allFiles: RepoFile[];
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}
