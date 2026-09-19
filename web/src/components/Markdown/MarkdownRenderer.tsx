import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import { Link } from "react-router-dom";
import { CodeBlock } from "./CodeBlock";
import { MermaidRenderer } from "./MermaidRenderer";
import { GITHUB_RAW_BASE } from "../../config/github";
import { isLocalFallbackActive } from "../../services/github";
import { Maximize2, X } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  currentFilePath: string;
}

/**
 * Resolve relative asset paths (images, diagrams) relative to current Markdown file location
 */
function resolveAssetPath(currentFilePath: string, assetPath: string): string {
  if (!assetPath) return assetPath;
  if (
    assetPath.startsWith("http://") ||
    assetPath.startsWith("https://") ||
    assetPath.startsWith("data:")
  ) {
    return assetPath;
  }

  const pathParts = currentFilePath.split("/");
  const currentDir = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "";

  const cleanRel = assetPath.replace(/\\/g, "/");
  const baseSegments = currentDir ? currentDir.split("/").filter(Boolean) : [];
  const relSegments = cleanRel.split("/").filter(Boolean);

  for (const seg of relSegments) {
    if (seg === ".") {
      continue;
    } else if (seg === "..") {
      baseSegments.pop();
    } else {
      baseSegments.push(seg);
    }
  }

  const resolvedPath = baseSegments.join("/");
  const isLocal = isLocalFallbackActive();

  if (isLocal) {
    return `/api/local-file?path=${encodeURIComponent(resolvedPath)}`;
  } else {
    return `${GITHUB_RAW_BASE}/${encodeURI(resolvedPath)}`;
  }
}

/**
 * Resolve relative link paths for Markdown notes and PDFs
 */
function resolveLinkPath(currentFilePath: string, href: string): string {
  const pathParts = currentFilePath.split("/");
  const currentDir = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "";
  const baseSegments = currentDir ? currentDir.split("/").filter(Boolean) : [];
  const relSegments = href.replace(/\\/g, "/").split("/").filter(Boolean);

  for (const seg of relSegments) {
    if (seg === ".") {
      continue;
    } else if (seg === "..") {
      baseSegments.pop();
    } else {
      baseSegments.push(seg);
    }
  }

  return baseSegments.join("/");
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  currentFilePath,
}) => {
  const [lightboxImg, setLightboxImg] = useState<{ src: string; alt: string } | null>(null);

  return (
    <div className="markdown-body dark:text-neutral-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          // Code block and Mermaid handling
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const language = match ? match[1] : "";

            if (language === "mermaid") {
              return <MermaidRenderer chart={codeString} />;
            }

            // Inline code detection
            const isInline = !className && !codeString.includes("\n");
            if (isInline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            return <CodeBlock language={language} value={codeString} />;
          },

          // Wrap tables in responsive scroll container
          table({ children, ...props }) {
            return (
              <div className="markdown-table-wrapper">
                <table {...props}>{children}</table>
              </div>
            );
          },

          // Links rewriting for internal notes and anchors
          a({ href, children, ...props }) {
            if (!href) return <a {...props}>{children}</a>;

            // Anchor links
            if (href.startsWith("#")) {
              return (
                <a
                  href={href}
                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  {...props}
                >
                  {children}
                </a>
              );
            }

            // Internal Markdown or PDF links
            const lowerHref = href.toLowerCase();
            if (
              lowerHref.endsWith(".md") ||
              lowerHref.endsWith(".markdown") ||
              lowerHref.endsWith(".pdf")
            ) {
              const targetPath = resolveLinkPath(currentFilePath, href);
              const isPdf = targetPath.toLowerCase().endsWith(".pdf");
              const route = isPdf
                ? `/pdf/${encodeURIComponent(targetPath)}`
                : `/note/${encodeURIComponent(targetPath)}`;

              return (
                <Link
                  to={route}
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  {children}
                </Link>
              );
            }

            // External links
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                {...props}
              >
                {children}
              </a>
            );
          },

          // Images: resolve relative paths and support lightbox view
          img({ src, alt, width, height, ...props }) {
            if (!src) return null;
            const resolvedSrc = resolveAssetPath(currentFilePath, src);

            return (
              <figure className="my-6 text-center group relative inline-block w-full">
                <div className="relative inline-block overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 shadow-sm max-w-full">
                  <img
                    src={resolvedSrc}
                    alt={alt || "Diagram"}
                    loading="lazy"
                    className="max-h-[650px] w-auto max-w-full object-contain mx-auto cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.01]"
                    style={width ? { maxWidth: typeof width === "number" ? `${width}px` : width } : undefined}
                    onClick={() => setLightboxImg({ src: resolvedSrc, alt: alt || "Diagram" })}
                    {...props}
                  />
                  <button
                    onClick={() => setLightboxImg({ src: resolvedSrc, alt: alt || "Diagram" })}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-neutral-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-neutral-900 shadow-md"
                    title="Enlarge image"
                    aria-label="Enlarge image"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
                {alt && (
                  <figcaption className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          },

          // Headings with anchor links
          h1({ id, children }) {
            return (
              <h1 id={id} className="group scroll-mt-20 relative">
                {children}
                {id && (
                  <a
                    href={`#${id}`}
                    className="opacity-0 group-hover:opacity-100 ml-2 text-neutral-400 dark:text-neutral-500 hover:text-blue-500 transition-opacity text-base no-underline"
                    aria-label="Link to section"
                  >
                    #
                  </a>
                )}
              </h1>
            );
          },
          h2({ id, children }) {
            return (
              <h2 id={id} className="group scroll-mt-20 relative">
                {children}
                {id && (
                  <a
                    href={`#${id}`}
                    className="opacity-0 group-hover:opacity-100 ml-2 text-neutral-400 dark:text-neutral-500 hover:text-blue-500 transition-opacity text-base no-underline"
                    aria-label="Link to section"
                  >
                    #
                  </a>
                )}
              </h2>
            );
          },
          h3({ id, children }) {
            return (
              <h3 id={id} className="group scroll-mt-20 relative">
                {children}
                {id && (
                  <a
                    href={`#${id}`}
                    className="opacity-0 group-hover:opacity-100 ml-2 text-neutral-400 dark:text-neutral-500 hover:text-blue-500 transition-opacity text-sm no-underline"
                    aria-label="Link to section"
                  >
                    #
                  </a>
                )}
              </h3>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Lightbox Modal for enlarged image inspection */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-150"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800/80 text-white hover:bg-neutral-700 cursor-pointer"
            title="Close image"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxImg.src}
            alt={lightboxImg.alt}
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
