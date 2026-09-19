import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "../../context/ThemeContext";

interface MermaidRendererProps {
  chart: string;
}

/**
 * Sanitize nested square brackets inside quoted node labels ["...[...]..."]
 * which break Mermaid's flowchart parser.
 */
function sanitizeMermaidChart(rawChart: string): string {
  return rawChart.replace(/\["([^"]*)"\]/g, (_match, innerText) => {
    const sanitized = innerText.replace(/\[/g, "(").replace(/\]/g, ")");
    return `["${sanitized}"]`;
  });
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
      securityLevel: "loose",
      fontFamily: "inherit",
    });

    const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
    let isMounted = true;

    async function renderChart() {
      try {
        setError(null);
        const cleanChart = sanitizeMermaidChart(chart.trim());
        const { svg: renderedSvg } = await mermaid.render(id, cleanChart);
        if (isMounted) {
          setSvg(renderedSvg);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error("Mermaid rendering failed:", err);
          setError("Failed to render Mermaid diagram. Click below to view source.");
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
      // Clean up temporary mermaid DOM artifacts if any
      const tempElement = document.getElementById(id);
      if (tempElement) {
        tempElement.remove();
      }
    };
  }, [chart, theme]);

  if (error) {
    return (
      <div className="my-6 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm">
        <p className="font-semibold text-amber-800 dark:text-amber-300 mb-2">{error}</p>
        <pre className="overflow-x-auto p-3 rounded bg-neutral-900 text-neutral-200 text-xs font-mono">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 flex justify-center overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-5 shadow-xs"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
