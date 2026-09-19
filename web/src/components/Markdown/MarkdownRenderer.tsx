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
          // Unwrap outer pre from ReactMarkdown since CodeBlock provides its own container
          pre({ children }) {
            return <>{children}</>;
          },

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

          // Images: resolve relative paths, prevent cropping, expand technical diagrams, support full width and lightbox
          img({ src, alt, ...props }) {
            if (!src) return null;
            const resolvedSrc = resolveAssetPath(currentFilePath, src);

            const isBadgeOrIcon =
              /badge|shield|icon|logo|avatar|star|flag/i.test(`${alt || ""} ${src || ""}`) ||
              (props.width && parseInt(String(props.width), 10) <= 64);

            if (isBadgeOrIcon) {
              return (
                <img
                  src={resolvedSrc}
                  alt={alt || "icon"}
                  loading="lazy"
                  className="inline-block align-middle max-w-full h-auto"
                  style={{ maxHeight: "none", height: "auto" }}
                />
              );
            }

            const isDiagram =
              /architecture|diagram|flow|workflow|design|system|model|lifecycle|pipeline|component|structure|schema|sequence|topology|overview|chart|graph|microservices|jpa|security|jwt|transaction|scaling|cache|wallet|exchange|payment|database|network|process/i.test(
                `${alt || ""} ${src || ""}`
              );

            return (
              <figure className="my-8 w-full flex flex-col items-center select-none overflow-visible">
                <div className="w-full flex justify-center items-center overflow-x-auto overflow-y-visible py-1">
                  <div className="relative group w-full flex justify-center items-center overflow-visible">
                    <img
                      src={resolvedSrc}
                      alt={alt || "Technical Architecture Diagram"}
                      loading="lazy"
                      className={`block h-auto cursor-zoom-in rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 transition-transform duration-150 hover:scale-[1.002] ${
                        isDiagram ? "w-full max-w-[1100px]" : "w-auto max-w-full"
                      }`}
                      style={{
                        width: isDiagram
                          ? "100%"
                          : props.width && !String(props.width).includes("%")
                          ? `${props.width}px`
                          : "auto",
                        maxWidth: isDiagram ? "1100px" : "100%",
                        height: "auto",
                        maxHeight: "none",
                        objectFit: "contain",
                      }}
                      onClick={() => setLightboxImg({ src: resolvedSrc, alt: alt || "Diagram" })}
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector(".img-fallback")) {
                          const fallback = document.createElement("div");
                          fallback.className =
                            "img-fallback p-4 my-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-500";
                          fallback.textContent = `Image could not be loaded (${src})`;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                    <button
                      onClick={() => setLightboxImg({ src: resolvedSrc, alt: alt || "Diagram" })}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-neutral-900/75 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-neutral-900 shadow-md"
                      title="Click to enlarge diagram"
                      aria-label="Click to enlarge diagram"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {alt && (
                  <figcaption className="mt-2.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium text-center">
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
