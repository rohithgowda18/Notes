import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertCircle,
  Loader2,
  ChevronRight as BreadcrumbChevron,
  Folder,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { isLocalFallbackActive } from "../../services/github";
import { GITHUB_RAW_BASE } from "../../config/github";
import { useRepo } from "../../context/RepoContext";
import { getFolderTargetRoute, getParentFolderPath } from "../../utils/navigation";

// Configure pdfjs worker to run in browser
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  filePath: string;
  pathParts?: string[];
}

interface SinglePageProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  onVisible: (pageNumber: number) => void;
  rootContainer: HTMLElement | null;
}

const PdfPageCanvas: React.FC<SinglePageProps> = ({
  pdfDoc,
  pageNumber,
  scale,
  onVisible,
  rootContainer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [pageDim, setPageDim] = useState<{ width: number; height: number } | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // 1. Get base page dimensions for aspect-ratio preservation placeholder
  useEffect(() => {
    let active = true;
    pdfDoc.getPage(pageNumber).then((page) => {
      if (active) {
        const vp = page.getViewport({ scale: 1 });
        setPageDim({ width: vp.width, height: vp.height });
      }
    });
    return () => {
      active = false;
    };
  }, [pdfDoc, pageNumber]);

  // 2. Pre-render IntersectionObserver: load canvas when nearing viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !rootContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setShouldRender(true);
        }
      },
      {
        root: rootContainer,
        rootMargin: "800px 0px 800px 0px", // Preload pages well ahead of scroll
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootContainer]);

  // 3. Active Page Visibility IntersectionObserver: update Page X / N indicator
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !rootContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          onVisible(pageNumber);
        }
      },
      {
        root: rootContainer,
        threshold: 0.3,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootContainer, pageNumber, onVisible]);

  // 4. Render PDF page onto canvas
  useEffect(() => {
    if (!shouldRender || !canvasRef.current) return;

    let renderTask: any = null;
    let isCancelled = false;

    async function render() {
      try {
        setIsRendering(true);
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale });
        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const canvasContext = canvas.getContext("2d");
        if (!canvasContext) return;

        const renderContext: any = {
          canvasContext,
          viewport,
          canvas,
        };

        if (pixelRatio !== 1) {
          renderContext.transform = [pixelRatio, 0, 0, pixelRatio, 0, 0];
        }

        renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error(`Error rendering PDF page ${pageNumber}:`, err);
        }
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    }

    render();

    return () => {
      isCancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          // ignore cancellation
        }
      }
    };
  }, [pdfDoc, pageNumber, scale, shouldRender]);

  const targetWidth = pageDim ? Math.floor(pageDim.width * scale) : 800;
  const targetHeight = pageDim ? Math.floor(pageDim.height * scale) : 1050;

  return (
    <div
      ref={containerRef}
      id={`pdf-page-${pageNumber}`}
      data-page-number={pageNumber}
      className="pdf-page-container mb-6 bg-white shadow-xl rounded-sm overflow-hidden flex justify-center relative select-none"
      style={{
        width: `${targetWidth}px`,
        height: `${targetHeight}px`,
      }}
    >
      <canvas ref={canvasRef} className="block" />
      {(!shouldRender || isRendering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-neutral-800/40 backdrop-blur-2xs">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span>Page {pageNumber}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const PdfViewer: React.FC<PdfViewerProps> = ({ filePath, pathParts = [] }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.2);
  const [isFitWidth, setIsFitWidth] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { allFiles } = useRepo();
  const fileName = filePath.split("/").pop() || "Document.pdf";
  const parentFolderPath = getParentFolderPath(filePath);
  const isLocalDev = import.meta.env.DEV && isLocalFallbackActive();
  const pdfUrl = isLocalDev
    ? `/api/local-file?path=${encodeURIComponent(filePath)}`
    : `${GITHUB_RAW_BASE}/${encodeURI(filePath)}`;

  // 1. Fetch & Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);
    setPdfDoc(null);
    setCurrentPage(1);

    async function loadPdf() {
      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error(`Failed to load PDF (${response.status} ${response.statusText}).`);
        }

        const arrayBuffer = await response.arrayBuffer();
        if (isCancelled) return;

        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: "https://unpkg.com/pdfjs-dist@legacy/cmaps/",
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error("PDF loading error:", err);
          const message = err instanceof Error ? err.message : "Unable to parse this PDF.";
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [pdfUrl]);

  // 2. Fit Width Calculation (Default Mode)
  const calculateFitWidth = useCallback(async () => {
    if (!pdfDoc || !scrollContainerRef.current) return;
    try {
      const page1 = await pdfDoc.getPage(1);
      const vp1 = page1.getViewport({ scale: 1 });
      const containerWidth = scrollContainerRef.current.clientWidth;
      // Reserve horizontal padding
      const availableWidth = Math.min(containerWidth - 64, 1150);
      if (availableWidth > 300) {
        const computedScale = Math.round((availableWidth / vp1.width) * 100) / 100;
        setScale(Math.max(computedScale, 0.5));
      }
    } catch (e) {
      console.warn("Could not calculate fit width scale", e);
    }
  }, [pdfDoc]);

  useEffect(() => {
    if (pdfDoc && isFitWidth) {
      calculateFitWidth();
    }
  }, [pdfDoc, isFitWidth, calculateFitWidth]);

  // Listen to window resize for Fit Width adjustment
  useEffect(() => {
    if (!isFitWidth) return;
    const handleResize = () => calculateFitWidth();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isFitWidth, calculateFitWidth]);

  // 3. Page Navigation
  const scrollToPage = (targetPage: number) => {
    const el = document.getElementById(`pdf-page-${targetPage}`);
    if (el && scrollContainerRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      scrollToPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      scrollToPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setIsFitWidth(false);
    setScale((prev) => Math.min(Math.round((prev + 0.15) * 100) / 100, 3.0));
  };

  const handleZoomOut = () => {
    setIsFitWidth(false);
    setScale((prev) => Math.max(Math.round((prev - 0.15) * 100) / 100, 0.5));
  };

  const handleToggleFitWidth = () => {
    setIsFitWidth(true);
    calculateFitWidth();
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col min-w-0 bg-white dark:bg-neutral-950 overflow-hidden">
      {/* Top Compact PDF Toolbar */}
      <div className="w-full shrink-0 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs select-none z-10 shadow-xs">
        {/* Left: Breadcrumbs, Back Link & Document Name */}
        <div className="flex items-center gap-1.5 min-w-0 font-sans truncate">
          {parentFolderPath && (
            <Link
              to={getFolderTargetRoute(parentFolderPath, allFiles)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors mr-1 shrink-0"
              title={`Back to ${parentFolderPath.split("/").pop()}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          )}

          <Link
            to="/note/README.md"
            className="text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 shrink-0 hidden sm:inline font-medium"
            title="Study Notes Overview"
          >
            Study Library
          </Link>
          {pathParts.length > 1 && (
            <>
              <BreadcrumbChevron className="w-3.5 h-3.5 text-neutral-400 shrink-0 hidden sm:inline" />
              <Link
                to={getFolderTargetRoute(pathParts[0], allFiles)}
                className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 truncate hidden md:flex"
                title={`Open ${pathParts[0]} notes`}
              >
                <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{pathParts[0]}</span>
              </Link>
            </>
          )}
          <BreadcrumbChevron className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
            {fileName}
          </span>
        </div>

        {/* Center/Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Page Navigator */}
          {numPages > 0 && (
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-2 py-1 border border-neutral-200 dark:border-neutral-700">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1 rounded text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                title="Previous Page"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] font-medium text-neutral-700 dark:text-neutral-200 px-1">
                Page {currentPage} / {numPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= numPages}
                className="p-1 rounded text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                title="Next Page"
                aria-label="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Zoom In / Out */}
          <div className="hidden sm:flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-2 py-1 border border-neutral-200 dark:border-neutral-700">
            <button
              onClick={handleZoomOut}
              className="p-0.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-mono text-[11px] font-medium text-neutral-700 dark:text-neutral-200">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-0.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fit Width Button */}
          <button
            onClick={handleToggleFitWidth}
            className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
              isFitWidth
                ? "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400"
                : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
            title="Fit document to reader width"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fit Width</span>
          </button>

          {/* Open Externally */}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium"
            title="Open in new browser tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open</span>
          </a>

          {/* Download */}
          <a
            href={pdfUrl}
            download={fileName}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-2xs transition-colors cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>

      {/* Continuous Vertical Scrolling Canvas Viewport */}
      <div
        ref={scrollContainerRef}
        className="flex-1 w-full overflow-y-auto bg-neutral-200/70 dark:bg-neutral-950 p-4 sm:p-8 flex flex-col items-center"
      >
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm font-medium">Loading document...</p>
          </div>
        )}

        {error && (
          <div className="max-w-md p-6 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 my-auto text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="font-semibold text-sm mb-1">Failed to load PDF</h3>
            <p className="text-xs text-red-600 dark:text-red-400 mb-4">{error}</p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Directly in Browser</span>
            </a>
          </div>
        )}

        {/* Stack of All PDF Pages with Continuous Scrolling */}
        {!loading && !error && pdfDoc && numPages > 0 && (
          <div className="flex flex-col items-center w-full">
            {Array.from({ length: numPages }, (_, index) => index + 1).map((pageNum) => (
              <PdfPageCanvas
                key={pageNum}
                pdfDoc={pdfDoc}
                pageNumber={pageNum}
                scale={scale}
                onVisible={(visibleNum) => setCurrentPage(visibleNum)}
                rootContainer={scrollContainerRef.current}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
