import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Folder,
  FolderOpen,
  FileText,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Search,
  ChevronRight,
} from "lucide-react";
import { useRepo } from "../context/RepoContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { EmptyState } from "../components/UI/EmptyState";
import type { RepoFolder } from "../types";

function formatName(name: string): string {
  return name.replace(/^[0-9]+[-_]/, "").replace(/[-_]/g, " ").replace(/\.(md|markdown|pdf)$/i, "");
}

function formatSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function findFolder(folders: RepoFolder[], path: string): RepoFolder | undefined {
  for (const f of folders) {
    if (f.path === path) return f;
    if (f.subfolders && f.subfolders.length > 0) {
      const found = findFolder(f.subfolders, path);
      if (found) return found;
    }
  }
  return undefined;
}

const MODULE_DESCRIPTIONS: Record<string, { desc: string }> = {
  "01-Operating-Systems": {
    desc: "Processes, threads, concurrency, CPU scheduling algorithms, virtual memory, paging, deadlocks, and interview cheatsheets.",
  },
  "02-DBMS": {
    desc: "Relational database modeling, SQL queries, transaction management, ACID properties, B-Trees, indexing, and normalization.",
  },
  "03-Computer-Networks": {
    desc: "OSI and TCP/IP stack layers, socket programming, DNS, HTTP/HTTPS protocols, routing algorithms, and network security.",
  },
  "04-OOPs-and-Design-Patterns": {
    desc: "Complete object-oriented design: Core OOPs, UML diagrams, SOLID principles, 23 GoF Design Patterns, and real-world LLD case studies.",
  },
};

function countTotalFiles(folder: RepoFolder): number {
  let count = folder.files.length;
  if (folder.subfolders) {
    for (const sub of folder.subfolders) {
      count += countTotalFiles(sub);
    }
  }
  return count;
}

export const FolderPage: React.FC = () => {
  const { "*": rawPath } = useParams();
  const folderPath = rawPath ? decodeURIComponent(rawPath) : "";
  const { tree, loading } = useRepo();
  const [filterQuery, setFilterQuery] = useState("");

  const isHub = !folderPath || folderPath === "" || folderPath === "notes";

  const folder = useMemo(() => {
    if (!tree || isHub) return undefined;
    return findFolder(tree.folders, folderPath);
  }, [tree, folderPath, isHub]);

  const folderTitle = isHub
    ? "Study Notes Library"
    : folder?.name
    ? formatName(folder.name)
    : "Study Notes";
  useDocumentTitle(folderTitle);

  const pathParts = folderPath ? folderPath.split("/") : [];
  const parentFolderPath = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "";

  const files = folder?.files || [];
  const subfolders = folder?.subfolders || [];

  const filteredFiles = useMemo(() => {
    if (!filterQuery.trim()) return files;
    const q = filterQuery.toLowerCase();
    return files.filter((f) => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q));
  }, [files, filterQuery]);

  if (loading) {
    return (
      <div className="flex-1 max-w-5xl mx-auto px-6 py-12 space-y-6 animate-pulse">
        <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
        <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-36 bg-neutral-100 dark:bg-neutral-900 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Hub View: Displays all study note modules
  if (isHub) {
    const modules = tree?.folders || [];
    const filteredModules = modules.filter((m) => {
      if (!filterQuery.trim()) return true;
      const q = filterQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        (MODULE_DESCRIPTIONS[m.name]?.desc || "").toLowerCase().includes(q) ||
        (m.subfolders || []).some((sf) => sf.name.toLowerCase().includes(q))
      );
    });

    return (
      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8 w-full min-w-0">
        {/* Breadcrumb */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <nav className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-sans flex-wrap">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              Dashboard
            </Link>
            <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Study Notes Modules</span>
          </nav>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                  Study Notes Library
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Select a subject module to explore full notes, diagrams, and cheat sheets
                </p>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="w-full sm:w-72">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter study modules..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredModules.map((mod) => {
            const totalFiles = countTotalFiles(mod);
            const meta = MODULE_DESCRIPTIONS[mod.name] || {
              desc: "Comprehensive engineering curriculum notes, diagrams, and interview revision guides.",
            };

            return (
              <Link
                key={mod.path}
                to={`/folder/${encodeURIComponent(mod.path)}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800/80 transition-all cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      <Folder className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {totalFiles} Note{totalFiles === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {formatName(mod.name)}
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                      {meta.desc}
                    </p>
                  </div>

                  {/* Subfolders if present */}
                  {mod.subfolders && mod.subfolders.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        Sub-chapters ({mod.subfolders.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {mod.subfolders.map((sub) => (
                          <span
                            key={sub.path}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                          >
                            <Folder className="w-2.5 h-2.5 text-amber-500" />
                            <span>{formatName(sub.name)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Explore Module</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="flex-1 max-w-2xl mx-auto px-6 py-20 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500">
          <Folder className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Folder Not Found
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          The folder <span className="font-mono text-xs">{folderPath}</span> does not exist or has
          been moved.
        </p>
        <div className="pt-2">
          <Link
            to="/notes"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Browse All Study Modules</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8 w-full min-w-0">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Link
            to={parentFolderPath ? `/folder/${encodeURIComponent(parentFolderPath)}` : "/"}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>{parentFolderPath ? `Back to ${formatName(parentFolderPath.split("/").pop() || "")}` : "Back to Dashboard"}</span>
          </Link>
        </div>

        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-sans flex-wrap">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            Dashboard
          </Link>
          <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
          <span className="text-neutral-600 dark:text-neutral-400">Study Notes</span>
          {pathParts.map((part, index) => {
            const isLast = index === pathParts.length - 1;
            const subPath = pathParts.slice(0, index + 1).join("/");
            return (
              <React.Fragment key={index}>
                <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
                {isLast ? (
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {formatName(part)}
                  </span>
                ) : (
                  <Link
                    to={`/folder/${encodeURIComponent(subPath)}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {formatName(part)}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Folder Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                {formatName(folder.name)}
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {files.length} document{files.length === 1 ? "" : "s"}
                {subfolders.length > 0 && ` • ${subfolders.length} subfolder${subfolders.length === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>
        </div>

        {/* In-folder filter */}
        <div className="w-full sm:w-72">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter files in this folder..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Subfolders Grid if any */}
      {subfolders.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Subfolders
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {subfolders.map((sf) => (
              <Link
                key={sf.path}
                to={`/folder/${encodeURIComponent(sf.path)}`}
                className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-xs transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {formatName(sf.name)}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 shrink-0">
                  {sf.files.length} files
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Files Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Documents & Guides ({filteredFiles.length})
        </h2>

        {filteredFiles.length === 0 ? (
          <EmptyState
            title="No documents found"
            description={
              filterQuery
                ? `No documents matching "${filterQuery}" in this folder.`
                : "No study notes or documents currently in this folder."
            }
            actionText={filterQuery ? "Clear Filter" : undefined}
            onAction={filterQuery ? () => setFilterQuery("") : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => {
              const isPdf = file.type === "pdf";
              const targetRoute = isPdf
                ? `/pdf/${encodeURIComponent(file.path)}`
                : `/note/${encodeURIComponent(file.path)}`;

              return (
                <Link
                  key={file.path}
                  to={targetRoute}
                  className="flex flex-col justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xs transition-all group cursor-pointer space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isPdf ? (
                          <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-500 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center">
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            isPdf
                              ? "bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400"
                              : "bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {isPdf ? "PDF" : "Markdown"}
                        </span>
                      </div>

                      {file.size && (
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {formatSize(file.size)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {formatName(file.name)}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/60 text-xs font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <span>{isPdf ? "Open PDF Document" : "Read Study Note"}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
