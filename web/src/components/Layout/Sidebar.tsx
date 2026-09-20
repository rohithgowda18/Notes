import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  BookOpen,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  Code2,
  Home,
} from "lucide-react";
import { useRepo } from "../../context/RepoContext";
import { useLeetcode } from "../../context/LeetcodeContext";
import type { RepoFile, RepoFolder, RepoTree } from "../../types";

type SidebarTab = "notes" | "leetcode";

interface SidebarProps {
  onItemClick?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const FOLDERS_STORAGE_KEY = "study_notes_expanded_folders";
const LC_FOLDERS_STORAGE_KEY = "leetcode_expanded_folders";
const SIDEBAR_TAB_KEY = "sidebar_active_tab";

function getFileDisplayName(fileName: string): string {
  return fileName.replace(/\.(md|markdown|pdf)$/i, "");
}

function formatLeetcodeName(fileName: string): string {
  const clean = fileName.replace(/\.(md|markdown)$/i, "");
  const match = clean.match(/^(\d+)-(.+)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    const title = match[2]
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return `${num}. ${title}`;
  }
  return clean;
}

function formatCategoryName(name: string): string {
  if (name === "dsa") return "DSA";
  if (name === "database") return "Database";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

interface FolderTreeItemProps {
  folder: RepoFolder;
  level: number;
  expandedFolders: Record<string, boolean>;
  onToggleFolder: (folderPath: string, level: number) => void;
  onItemClick?: () => void;
  currentPath: string;
  allFiles: RepoFile[];
  routePrefix?: string;
  formatName?: (name: string) => string;
  formatFolderName?: (name: string) => string;
  accentColor?: string;
}

const FolderTreeItem: React.FC<FolderTreeItemProps> = ({
  folder,
  level,
  expandedFolders,
  onToggleFolder,
  onItemClick,
  currentPath,
  allFiles,
  routePrefix = "/note",
  formatName = getFileDisplayName,
  formatFolderName,
  accentColor = "blue",
}) => {
  const isOpen =
    expandedFolders[folder.path] !== undefined
      ? expandedFolders[folder.path]
      : level === 0;

  const folderDisplayName = formatFolderName ? formatFolderName(folder.name) : folder.name;

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between w-full px-1 py-1 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors group">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFolder(folder.path, level);
          }}
          className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
          title={isOpen ? "Collapse folder" : "Expand folder"}
          aria-label={isOpen ? "Collapse folder" : "Expand folder"}
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          )}
        </button>

        <Link
          to={
            routePrefix === "/leetcode/note"
              ? `/leetcode/folder/${encodeURIComponent(folder.path)}`
              : `/folder/${encodeURIComponent(folder.path)}`
          }
          onClick={() => {
            if (!isOpen) {
              onToggleFolder(folder.path, level);
            }
            if (onItemClick) {
              onItemClick();
            }
          }}
          className="flex-1 flex items-center gap-1.5 min-w-0 py-0.5 truncate text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
          title={`Open ${folderDisplayName} overview`}
        >
          {isOpen ? (
            <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span className="truncate">{folderDisplayName}</span>
        </Link>
      </div>

      {isOpen && (
        <div className="pl-2 ml-3 border-l border-neutral-200 dark:border-neutral-800 space-y-0.5">
          {folder.files.map((file) => {
            const isPdf = file.type === "pdf";
            const route = isPdf
              ? `/pdf/${encodeURIComponent(file.path)}`
              : `${routePrefix}/${encodeURIComponent(file.path)}`;
            const isActive = currentPath === file.path;

            const activeClass =
              accentColor === "emerald"
                ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 font-medium"
                : "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-medium";

            return (
              <Link
                key={file.path}
                to={route}
                onClick={onItemClick}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors truncate ${
                  isActive
                    ? activeClass
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60"
                }`}
                title={file.name}
              >
                {isPdf ? (
                  <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                ) : accentColor === "emerald" ? (
                  <Code2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                )}
                <span className="truncate">{formatName(file.name)}</span>
              </Link>
            );
          })}

          {folder.subfolders.map((sub) => (
            <FolderTreeItem
              key={sub.path}
              folder={sub}
              level={level + 1}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              onItemClick={onItemClick}
              currentPath={currentPath}
              allFiles={allFiles}
              routePrefix={routePrefix}
              formatName={formatName}
              formatFolderName={formatFolderName}
              accentColor={accentColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function FileTree({
  tree,
  loading,
  expandedFolders,
  onToggleFolder,
  onItemClick,
  currentPath,
  routePrefix = "/note",
  formatName = getFileDisplayName,
  formatFolderName,
  accentColor = "blue",
}: {
  tree: RepoTree | null;
  loading: boolean;
  expandedFolders: Record<string, boolean>;
  onToggleFolder: (folderPath: string, level: number) => void;
  onItemClick?: () => void;
  currentPath: string;
  routePrefix?: string;
  formatName?: (name: string) => string;
  formatFolderName?: (name: string) => string;
  accentColor?: string;
}) {
  if (loading) {
    return (
      <div className="space-y-3 py-4">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-1/2" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-5/6" />
      </div>
    );
  }

  if (!tree || (tree.folders.length === 0 && tree.rootFiles.length === 0)) {
    return (
      <div className="text-xs text-neutral-400 dark:text-neutral-500 py-6 text-center">
        No items found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tree.folders.map((folder) => (
        <FolderTreeItem
          key={folder.path}
          folder={folder}
          level={0}
          expandedFolders={expandedFolders}
          onToggleFolder={onToggleFolder}
          onItemClick={onItemClick}
          currentPath={currentPath}
          allFiles={tree.allFiles}
          routePrefix={routePrefix}
          formatName={formatName}
          formatFolderName={formatFolderName}
          accentColor={accentColor}
        />
      ))}

      {tree.rootFiles.length > 0 && (
        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            General
          </div>
          <ul className="space-y-0.5">
            {tree.rootFiles.map((file) => {
              const isPdf = file.type === "pdf";
              const route = isPdf
                ? `/pdf/${encodeURIComponent(file.path)}`
                : `${routePrefix}/${encodeURIComponent(file.path)}`;
              const isActive = currentPath === file.path;

              const activeClass =
                accentColor === "emerald"
                  ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 font-medium"
                  : "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-medium";

              return (
                <li key={file.path}>
                  <Link
                    to={route}
                    onClick={onItemClick}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] transition-colors truncate ${
                      isActive
                        ? activeClass
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60"
                    }`}
                    title={file.name}
                  >
                    {isPdf ? (
                      <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    ) : accentColor === "emerald" ? (
                      <Code2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    )}
                    <span className="truncate">{formatName(file.name)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export const Sidebar: React.FC<SidebarProps> = ({
  onItemClick,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { tree: notesTree, loading: notesLoading } = useRepo();
  const { tree: lcTree, loading: lcLoading } = useLeetcode();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<SidebarTab>(() => {
    // If the URL starts with /leetcode, default to leetcode tab
    if (location.pathname.startsWith("/leetcode")) return "leetcode";
    const saved = localStorage.getItem(SIDEBAR_TAB_KEY);
    return (saved === "leetcode" ? "leetcode" : "notes") as SidebarTab;
  });

  // Sync tab with route
  useEffect(() => {
    if (location.pathname.startsWith("/leetcode")) {
      setActiveTab("leetcode");
    } else if (location.pathname.startsWith("/note") || location.pathname.startsWith("/pdf")) {
      setActiveTab("notes");
    }
  }, [location.pathname]);

  const handleTabChange = (tab: SidebarTab) => {
    setActiveTab(tab);
    localStorage.setItem(SIDEBAR_TAB_KEY, tab);
  };

  // Notes expanded folders
  const [notesExpandedFolders, setNotesExpandedFolders] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(FOLDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // LeetCode expanded folders
  const [lcExpandedFolders, setLcExpandedFolders] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(LC_FOLDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const currentPath = decodeURIComponent(location.pathname)
    .replace(/^\/(note|pdf|leetcode\/note)\//, "");

  const toggleNotesFolder = (folderPath: string, level: number) => {
    setNotesExpandedFolders((prev) => {
      const currentIsOpen = prev[folderPath] !== undefined ? prev[folderPath] : level === 0;
      const updated = { ...prev, [folderPath]: !currentIsOpen };
      try {
        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save folder state", e);
      }
      return updated;
    });
  };

  const toggleLcFolder = (folderPath: string, level: number) => {
    setLcExpandedFolders((prev) => {
      const currentIsOpen = prev[folderPath] !== undefined ? prev[folderPath] : level === 0;
      const updated = { ...prev, [folderPath]: !currentIsOpen };
      try {
        localStorage.setItem(LC_FOLDERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save folder state", e);
      }
      return updated;
    });
  };

  // Auto-expand parent folders of current active file
  useEffect(() => {
    if (!currentPath) return;

    const parts = currentPath.split("/");
    if (parts.length > 1) {
      const pathsToOpen: string[] = [];
      let acc = "";
      for (let i = 0; i < parts.length - 1; i++) {
        acc = acc ? `${acc}/${parts[i]}` : parts[i];
        pathsToOpen.push(acc);
      }

      const setter = activeTab === "leetcode" ? setLcExpandedFolders : setNotesExpandedFolders;
      const storageKey = activeTab === "leetcode" ? LC_FOLDERS_STORAGE_KEY : FOLDERS_STORAGE_KEY;

      setter((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const p of pathsToOpen) {
          if (next[p] !== true) {
            next[p] = true;
            changed = true;
          }
        }
        if (changed) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(next));
          } catch (e) {
            console.warn("Could not save folder state", e);
          }
          return next;
        }
        return prev;
      });
    }
  }, [currentPath, activeTab]);

  if (isCollapsed) {
    return (
      <aside className="w-12 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md h-[calc(100vh-3.5rem)] sticky top-14 flex flex-col items-center py-4 select-none">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          title="Expand Sidebar"
          aria-label="Expand Sidebar"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>
      </aside>
    );
  }

  const lcCount = lcTree?.allFiles.length || 0;

  return (
    <aside className="w-72 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md h-[calc(100vh-3.5rem)] sticky top-14 flex flex-col select-none">
      {/* Sidebar Header with Dashboard Link & Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 p-2 space-y-1.5">
        <Link
          to="/"
          onClick={onItemClick}
          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group cursor-pointer"
          title="Return to Dashboard"
        >
          <div className="flex items-center gap-2">
            <Home className="w-3.5 h-3.5 text-neutral-400 group-hover:text-blue-500 transition-colors" />
            <span>Dashboard Hub</span>
          </div>
          <ChevronRight className="w-3 h-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5 w-full">
            <button
              onClick={() => handleTabChange("notes")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "notes"
                  ? "bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              title="Study Notes"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Notes</span>
            </button>
            <button
              onClick={() => handleTabChange("leetcode")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "leetcode"
                  ? "bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              title={`LeetCode Solutions (${lcCount})`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">LeetCode</span>
              {lcCount > 0 && (
                <span className={`text-[9px] px-1 py-0 rounded-full font-mono ${
                  activeTab === "leetcode"
                    ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                    : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                }`}>
                  {lcCount}
                </span>
              )}
            </button>
          </div>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Files & Folders Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 text-sm">
        {activeTab === "notes" ? (
          <FileTree
            tree={notesTree}
            loading={notesLoading}
            expandedFolders={notesExpandedFolders}
            onToggleFolder={toggleNotesFolder}
            onItemClick={onItemClick}
            currentPath={currentPath}
            routePrefix="/note"
            accentColor="blue"
          />
        ) : (
          <FileTree
            tree={lcTree}
            loading={lcLoading}
            expandedFolders={lcExpandedFolders}
            onToggleFolder={toggleLcFolder}
            onItemClick={onItemClick}
            currentPath={currentPath}
            routePrefix="/leetcode/note"
            formatName={formatLeetcodeName}
            formatFolderName={formatCategoryName}
            accentColor="emerald"
          />
        )}
      </div>
    </aside>
  );
};
