import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { RepoProvider } from "./context/RepoContext";
import { LeetcodeProvider } from "./context/LeetcodeContext";
import { ToastProvider } from "./context/ToastContext";
import { Header } from "./components/Layout/Header";
import { Sidebar } from "./components/Layout/Sidebar";
import { MobileNav } from "./components/Layout/MobileNav";
import { SearchModal } from "./components/Search/SearchModal";
import { NotePage } from "./pages/NotePage";
import { PdfPage } from "./pages/PdfPage";
import { LeetcodeNotePage } from "./pages/LeetcodeNotePage";
import { DashboardPage } from "./pages/DashboardPage";
import { FolderPage } from "./pages/FolderPage";
import { LeetcodeFolderPage } from "./pages/LeetcodeFolderPage";
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

function MainLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const location = useLocation();
  const isDashboard = location.pathname === "/";

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
        onToggleSidebar={!isDashboard ? toggleSidebarCollapse : undefined}
      />

      {/* Main Reading Workspace */}
      <div className="flex-1 flex w-full">
        {/* Persistent Left Sidebar - hidden on dashboard */}
        {!isDashboard && (
          <div className="hidden lg:block shrink-0">
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={toggleSidebarCollapse}
            />
          </div>
        )}

        {/* Mobile Nav Slide-Over */}
        <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

        {/* Dedicated Document Reading View */}
        <main className="flex-1 flex flex-col min-w-0">
          <Routes>
            <Route path="/" element={<DashboardPage onOpenSearch={() => setIsSearchOpen(true)} />} />
            <Route path="/notes" element={<FolderPage />} />
            <Route path="/folder" element={<FolderPage />} />
            <Route path="/folder/*" element={<FolderPage />} />
            <Route path="/leetcode" element={<LeetcodeFolderPage />} />
            <Route path="/leetcode/folder" element={<LeetcodeFolderPage />} />
            <Route path="/leetcode/folder/*" element={<LeetcodeFolderPage />} />
            <Route path="/note/*" element={<NotePage />} />
            <Route path="/pdf/*" element={<PdfPage />} />
            <Route path="/leetcode/note/*" element={<LeetcodeNotePage />} />
            <Route path="*" element={<NotFoundPage onOpenSearch={() => setIsSearchOpen(true)} />} />
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
      <ToastProvider>
        <RepoProvider>
          <LeetcodeProvider>
            <BrowserRouter>
              <ScrollRestoration />
              <MainLayout />
            </BrowserRouter>
          </LeetcodeProvider>
        </RepoProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
