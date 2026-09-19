import React, { useState } from "react";
import { Download, ExternalLink, FileText, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { GITHUB_RAW_BASE } from "../../config/github";

interface PdfViewerProps {
  filePath: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ filePath }) => {
  const [zoom, setZoom] = useState<number>(100);
  const rawUrl = `${GITHUB_RAW_BASE}/${encodeURI(filePath)}`;
  const fileName = filePath.split("/").pop() || "Document.pdf";

  // Google Docs PDF Viewer embed URL for universal cross-browser rendering
  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    rawUrl
  )}&embedded=true`;

  const [useGoogleViewer, setUseGoogleViewer] = useState<boolean>(true);

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
      {/* PDF Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-700/80">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-5 h-5 text-red-500 shrink-0" />
          <span className="font-medium text-sm text-neutral-800 dark:text-neutral-200 truncate">
            {fileName}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-neutral-700/60 border border-neutral-300 dark:border-neutral-600 rounded-lg px-2 py-1 text-xs">
            <button
              onClick={() => setZoom((prev) => Math.max(prev - 15, 50))}
              className="p-0.5 hover:text-blue-500 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-mono text-neutral-600 dark:text-neutral-300">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((prev) => Math.min(prev + 15, 175))}
              className="p-0.5 hover:text-blue-500 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle Native / Google Viewer */}
          <button
            onClick={() => setUseGoogleViewer((prev) => !prev)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700/60 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 cursor-pointer"
            title="Switch PDF viewer engine"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden md:inline">{useGoogleViewer ? "Native Embed" : "Google Viewer"}</span>
          </button>

          {/* Direct Raw View / Open in new tab */}
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700/60 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open</span>
          </a>

          {/* Download button */}
          <a
            href={rawUrl}
            download={fileName}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>

      {/* PDF Viewport */}
      <div className="flex-1 w-full bg-neutral-200 dark:bg-neutral-950 overflow-hidden relative">
        <iframe
          src={useGoogleViewer ? googleDocsViewerUrl : rawUrl}
          title={fileName}
          className="w-full h-full border-none"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
        />
      </div>
    </div>
  );
};
