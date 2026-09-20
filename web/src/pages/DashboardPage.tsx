import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Code2,
  Folder,
  ArrowRight,
  Search,
  Sparkles,
  Layers,
  Database,
  Terminal,
  Cpu,
  Bookmark,
  Mail,
  Phone,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useRepo } from "../context/RepoContext";
import { useLeetcode } from "../context/LeetcodeContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useToast } from "../context/ToastContext";

interface DashboardPageProps {
  onOpenSearch?: () => void;
}

function formatFolderName(name: string): string {
  return name.replace(/^[0-9]+[-_]/, "").replace(/[-_]/g, " ");
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenSearch }) => {
  useDocumentTitle("Home Dashboard");
  const { showSuccess } = useToast();
  const { tree: notesTree, loading: notesLoading } = useRepo();
  const { tree: lcTree, loading: lcLoading } = useLeetcode();

  // Metrics for Study Notes
  const totalNotes = notesTree?.allFiles.filter((f) => f.type === "markdown").length || 0;
  const totalPdfs = notesTree?.allFiles.filter((f) => f.type === "pdf").length || 0;
  const folders = notesTree?.folders || [];

  // Metrics for LeetCode
  const lcFiles = lcTree?.allFiles || [];
  const dsaFiles = lcFiles.filter((f) => f.path.startsWith("dsa/"));
  const dbFiles = lcFiles.filter((f) => f.path.startsWith("database/"));

  const firstNotePath =
    folders[0]?.files[0]?.path
      ? `/note/${encodeURIComponent(folders[0].files[0].path)}`
      : "/note/README.md";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-neutral-50/50 dark:bg-neutral-950 px-4 sm:px-6 md:px-12 py-10 md:py-16">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Engineering Knowledge Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Study Notes & Solutions
          </h1>

          <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base leading-relaxed">
            Select a workspace to dive into detailed architectural concepts, core computer science
            modules, or optimal LeetCode algorithm solutions.
          </p>

          {/* Quick Search Bar trigger */}
          {onOpenSearch && (
            <div className="pt-2 max-w-lg mx-auto">
              <button
                onClick={onOpenSearch}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-400 dark:text-neutral-500 transition-all shadow-xs group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-sm">
                  <Search className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
                  <span>Search notes, questions, algorithms...</span>
                </div>
                <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-500 dark:text-neutral-400">
                  Ctrl K
                </kbd>
              </button>
            </div>
          )}
        </div>

        {/* Two Main Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1: Study Notes */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-blue-100 dark:border-blue-950/60 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800/80 transition-all">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
                  {folders.length} Modules
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Study Notes Library
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Comprehensive notes covering Operating Systems, DBMS, Computer Networks, Core
                  Java, Spring Boot frameworks, and System Design patterns.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 py-3 border-y border-neutral-100 dark:border-neutral-800/80">
                <div className="text-left">
                  <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {notesLoading ? "..." : totalNotes}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Markdown Notes
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {notesLoading ? "..." : totalPdfs}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    PDF Cheatsheets
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {notesLoading ? "..." : folders.length}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Core Chapters
                  </div>
                </div>
              </div>

              {/* Category Chips */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Explore Categories
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {folders.map((f) => (
                    <Link
                      key={f.path}
                      to={`/folder/${encodeURIComponent(f.path)}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-neutral-100 dark:bg-neutral-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                    >
                      <Folder className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{formatFolderName(f.name)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800/80">
              <Link
                to={firstNotePath}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-xs hover:shadow group/btn cursor-pointer"
              >
                <span>Browse Study Notes</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: LeetCode Solutions */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-emerald-100 dark:border-emerald-950/60 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-800/80 transition-all">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
                  <Code2 className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                  {lcFiles.length} Solved
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  LeetCode Solutions
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Curated algorithmic and SQL database solutions. Includes problem descriptions,
                  clean Java/Python implementations, complexity notes, and approach breakdowns.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 py-3 border-y border-neutral-100 dark:border-neutral-800/80">
                <div className="text-left">
                  <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {lcLoading ? "..." : lcFiles.length}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Total Problems
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {lcLoading ? "..." : dsaFiles.length}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    DSA Problems
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {lcLoading ? "..." : dbFiles.length}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    SQL Queries
                  </div>
                </div>
              </div>

              {/* Category Chips */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Problem Categories
                </span>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/leetcode/folder/dsa"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 transition-colors cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>DSA Algorithms ({dsaFiles.length})</span>
                  </Link>
                  <Link
                    to="/leetcode/folder/database"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 transition-colors cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Database / SQL ({dbFiles.length})</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800/80">
              <Link
                to="/leetcode/folder/dsa"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-xs hover:shadow group/btn cursor-pointer"
              >
                <span>Browse LeetCode Solutions</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Highlights / Key Topics */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-blue-500" />
              <span>Quick Access Topics</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                title: "Spring Boot",
                icon: Layers,
                route: "/folder/06-Java-and-Spring-Boot",
                desc: "IOC, MVC, Security, JPA",
                color: "text-green-500",
              },
              {
                title: "DBMS",
                icon: Database,
                route: "/folder/02-DBMS",
                desc: "Queries, Normalization, ACID",
                color: "text-blue-500",
              },
              {
                title: "OS Core",
                icon: Cpu,
                route: "/folder/01-Operating-Systems",
                desc: "Processes, Memory, Threads",
                color: "text-purple-500",
              },
              {
                title: "Two Sum",
                icon: Code2,
                route: "/leetcode/note/dsa/0167-two-sum-ii-input-array-is-sorted.md",
                desc: "Sorted array, two pointers",
                color: "text-emerald-500",
              },
              {
                title: "Course Schedule",
                icon: Code2,
                route: "/leetcode/note/dsa/0207-course-schedule.md",
                desc: "Topological Sort & Kahn's",
                color: "text-emerald-500",
              },
              {
                title: "LRU Cache",
                icon: Code2,
                route: "/leetcode/note/dsa/0146-lru-cache.md",
                desc: "Doubly Linked List + Map",
                color: "text-emerald-500",
              },
            ].map((topic) => {
              const Icon = topic.icon;
              return (
                <Link
                  key={topic.title}
                  to={topic.route}
                  className="flex flex-col justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xs transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${topic.color}`} />
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {topic.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1">
                    {topic.desc}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Author & Contact Info */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xs">
            <div className="space-y-1 max-w-lg">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Rohith Gowda K S
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Computer Science & Backend Engineering • Maintained on GitHub • Open for
                collaborations and technical inquiries.
              </p>
            </div>

            {/* Contact Links & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Clickable Email */}
              <div className="inline-flex items-center rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 p-1">
                <a
                  href="mailto:rohithgowda.ks@gmail.com"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Send an email"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span>rohithgowda.ks@gmail.com</span>
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("rohithgowda.ks@gmail.com");
                    showSuccess("Email copied to clipboard!");
                  }}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                  title="Copy email to clipboard"
                  aria-label="Copy email to clipboard"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>

              {/* Clickable Phone Number */}
              <div className="inline-flex items-center rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 p-1">
                <a
                  href="tel:+919902634351"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  title="Call or message phone number"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>+91 99026 34351</span>
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("+919902634351");
                    showSuccess("Phone number copied to clipboard!");
                  }}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                  title="Copy phone number to clipboard"
                  aria-label="Copy phone number to clipboard"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>

              {/* GitHub Link */}
              <a
                href="https://github.com/rohithgowda18"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                title="View GitHub profile"
              >
                <span>GitHub Profile</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
