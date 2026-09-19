import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { RepoProvider, useRepo } from "./context/RepoContext";
import { Header } from "./components/Layout/Header";
import { Sidebar } from "./components/Layout/Sidebar";
import { MobileNav } from "./components/Layout/MobileNav";
import { SearchModal } from "./components/Search/SearchModal";
import { NotePage } from "./pages/NotePage";
import { PdfPage } from "./pages/PdfPage";
import { NotFoundPage } from "./pages/NotFoundPage";

const SIDEBAR_COLLAPSE_KEY = "study_notes_sidebar_collapsed";

// Scroll to top on route change unless anchor present
function ScrollRestoration() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

// HomeRedirect: Automatically opens the first note or README so the site is immediately a document reader
function HomeRedirect() {
  const { tree, loading } = useRepo();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-neutral-400">
        <div className="space-y-4 max-w-md w-full animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-4/5" />
        </div>
      </div>
    );
  }

  // Find preferred default note: README.md or first markdown file in first folder
  const firstNote =
    tree?.allFiles.find((f) => f.name.toLowerCase() === "readme.md") ||
    tree?.folders[0]?.files.find((f) => f.type === "markdown") ||
    tree?.allFiles.find((f) => f.type === "markdown");

  if (firstNote) {
    return <Navigate to={`/note/${encodeURIComponent(firstNote.path)}`} replace />;
  }

  return <NotFoundPage />;
}

function MainLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Remember sidebar collapse state across sessions
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "true";
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next.toString());
      return next;
    });
  };

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-150">
      {/* Top Navigation Bar */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleMobileNav={() => setIsMobileNavOpen(true)}
        onToggleSidebar={toggleSidebarCollapse}
      />

      {/* Main Reading Workspace */}
      <div className="flex-1 flex w-full">
        {/* Persistent Left Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
        </div>

        {/* Mobile Nav Slide-Over */}
        <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

        {/* Dedicated Document Reading View */}
        <main className="flex-1 flex flex-col min-w-0">
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/note/*" element={<NotePage />} />
            <Route path="/pdf/*" element={<PdfPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      {/* Full-Text Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RepoProvider>
        <BrowserRouter>
          <ScrollRestoration />
          <MainLayout />
        </BrowserRouter>
      </RepoProvider>
    </ThemeProvider>
  );
}
