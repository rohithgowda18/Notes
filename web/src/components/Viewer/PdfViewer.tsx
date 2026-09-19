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
  FileText,
} from "lucide-react";
import { GITHUB_RAW_BASE } from "../../config/github";
import { isLocalFallbackActive } from "../../services/github";

// Configure pdfjs worker to run in browser
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  filePath: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ filePath }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(120);
  const [loading, setLoading] = useState<boolean>(true);
  const [rendering, setRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileName = filePath.split("/").pop() || "Document.pdf";
  const isLocal = isLocalFallbackActive();
  const pdfUrl = isLocal
    ? `/api/local-file?path=${encodeURIComponent(filePath)}`
    : `${GITHUB_RAW_BASE}/${encodeURI(filePath)}`;

  // 1. Fetch & Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);
    setPdfDoc(null);

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
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error("PDF load error:", err);
          const msg = err instanceof Error ? err.message : "Unable to render this PDF file.";
          setError(msg);
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [pdfUrl]);

  // 2. Render Page to Canvas
  const renderPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        setRendering(true);
        const page = await pdfDoc.getPage(pageNumber);
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        const scale = zoom / 100;
        const viewport = page.getViewport({ scale });

        // High-DPI screen sharpness
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        const renderContext = {
          canvasContext: context,
          viewport,
          transform,
          canvas,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error("Error rendering PDF page:", err);
      } finally {
        setRendering(false);
      }
    },
    [pdfDoc, zoom]
  );

  useEffect(() => {
    if (pdfDoc && currentPage > 0) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, zoom, renderPage]);

  // Page Controls
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < numPages) setCurrentPage((prev) => prev + 1);
  };

  const handleFitWidth = async () => {
    if (!pdfDoc || !containerRef.current) return;
    try {
      const page = await pdfDoc.getPage(currentPage);
      const containerWidth = containerRef.current.clientWidth - 48; // padding
      const defaultViewport = page.getViewport({ scale: 1 });
      const fitScale = (containerWidth / defaultViewport.width) * 100;
      setZoom(Math.min(Math.max(Math.floor(fitScale), 60), 250));
    } catch (e) {
      console.warn("Fit width calculation error", e);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-4.5rem)] rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
      {/* PDF Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800/90 border-b border-neutral-200 dark:border-neutral-750 text-xs select-none">
        {/* Title */}
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-red-500 shrink-0" />
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
            {fileName}
          </span>
        </div>

        {/* Page & Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Page Navigator */}
          {numPages > 0 && (
            <div className="flex items-center gap-1 bg-white dark:bg-neutral-700 rounded-lg px-2 py-1 border border-neutral-300 dark:border-neutral-600">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-0.5 text-neutral-600 dark:text-neutral-200 hover:text-blue-500 disabled:opacity-40 cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-200 px-1">
                Page {currentPage} / {numPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= numPages}
                className="p-0.5 text-neutral-600 dark:text-neutral-200 hover:text-blue-500 disabled:opacity-40 cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Zoom In / Out */}
          <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-neutral-700 rounded-lg px-2 py-1 border border-neutral-300 dark:border-neutral-600">
            <button
              onClick={() => setZoom((prev) => Math.max(prev - 20, 50))}
              className="p-0.5 hover:text-blue-500 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-9 text-center font-mono text-[11px] text-neutral-700 dark:text-neutral-200">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((prev) => Math.min(prev + 20, 250))}
              className="p-0.5 hover:text-blue-500 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fit Width */}
          <button
            onClick={handleFitWidth}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 font-medium cursor-pointer"
            title="Fit to page width"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fit Width</span>
          </button>

          {/* Open in New Tab */}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 font-medium"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open</span>
          </a>

          {/* Download */}
          <a
            href={pdfUrl}
            download={fileName}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-2xs"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>

      {/* PDF Canvas Viewport */}
      <div
        ref={containerRef}
        className="flex-1 w-full overflow-auto bg-neutral-200/80 dark:bg-neutral-950 p-4 sm:p-8 flex justify-center items-start"
      >
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm font-medium">Loading PDF document...</p>
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Directly in Browser</span>
            </a>
          </div>
        )}

        {/* Canvas Display */}
        <div className="relative shadow-2xl rounded-md overflow-hidden bg-white">
          {rendering && (
            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-neutral-900/60 text-white text-[10px] flex items-center gap-1 backdrop-blur-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Rendering...</span>
            </div>
          )}
          <canvas ref={canvasRef} className="block max-w-none" />
        </div>
      </div>
    </div>
  );
};
