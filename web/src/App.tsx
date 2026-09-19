import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { RepoProvider } from "./context/RepoContext";
import { Header } from "./components/Layout/Header";
import { Sidebar } from "./components/Layout/Sidebar";
import { MobileNav } from "./components/Layout/MobileNav";
import { SearchModal } from "./components/Search/SearchModal";
import { HomePage } from "./pages/HomePage";
import { NotePage } from "./pages/NotePage";
import { PdfPage } from "./pages/PdfPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// Scroll to top helper when switching routes (unless restoring note scroll)
function ScrollRestoration() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === "/" || pathname.startsWith("/pdf/")) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

function MainLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
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
    <div className="min-h-screen flex flex-col bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-150">
      {/* Top Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleMobileNav={() => setIsMobileNavOpen(true)}
      />

      {/* Main Workspace Area with Sidebar */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Sticky Left Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Slide-Over Drawer */}
        <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 flex flex-col min-w-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/note/*" element={<NotePage />} />
            <Route path="/pdf/*" element={<PdfPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      {/* Global Search Modal */}
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
