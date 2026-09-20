import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";

const CODE_FONT_STACK =
  '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

// Override oneDark and oneLight to eliminate any background on inner code element and enforce typography
const cleanDarkTheme: Record<string, React.CSSProperties> = {
  ...(oneDark as Record<string, React.CSSProperties>),
  'code[class*="language-"]': {
    ...((oneDark as Record<string, React.CSSProperties>)['code[class*="language-"]'] || {}),
    background: "transparent",
    backgroundColor: "transparent",
    fontFamily: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
  },
  'pre[class*="language-"]': {
    ...((oneDark as Record<string, React.CSSProperties>)['pre[class*="language-"]'] || {}),
    background: "transparent",
    backgroundColor: "transparent",
    fontFamily: CODE_FONT_STACK,
    fontSize: "15px",
    lineHeight: "1.65",
  },
};

const cleanLightTheme: Record<string, React.CSSProperties> = {
  ...(oneLight as Record<string, React.CSSProperties>),
  'code[class*="language-"]': {
    ...((oneLight as Record<string, React.CSSProperties>)['code[class*="language-"]'] || {}),
    background: "transparent",
    backgroundColor: "transparent",
    fontFamily: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
  },
  'pre[class*="language-"]': {
    ...((oneLight as Record<string, React.CSSProperties>)['pre[class*="language-"]'] || {}),
    background: "transparent",
    backgroundColor: "transparent",
    fontFamily: CODE_FONT_STACK,
    fontSize: "15px",
    lineHeight: "1.65",
  },
};

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = "text", value }) => {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const { showSuccess } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      showSuccess("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  // Clean and normalize language name
  const rawLang = language.replace(/^language-/, "").toLowerCase();
  const langMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    tsx: "tsx",
    jsx: "jsx",
    py: "python",
    sh: "bash",
    shell: "bash",
    zsh: "bash",
    yml: "yaml",
    docker: "dockerfile",
  };
  const normalizedLang = langMap[rawLang] || rawLang || "text";
  const displayLang = (rawLang || "code").toUpperCase();

  return (
    <div className="code-block w-full my-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#11141d] overflow-hidden shadow-xs">
      {/* Code Header Bar */}
      <div className="code-header flex items-center justify-between px-3 py-2 bg-neutral-100/90 dark:bg-[#161b26] border-b border-neutral-200 dark:border-neutral-800/80 select-none">
        <span className="text-[11px] font-mono font-semibold tracking-wider text-neutral-600 dark:text-neutral-300">
          {displayLang}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all bg-white dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 shadow-2xs cursor-pointer active:scale-95"
          title="Copy code to clipboard"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Viewport with Horizontal Scroll */}
      <div className="code-content overflow-x-auto w-full">
        <SyntaxHighlighter
          language={normalizedLang}
          style={theme === "dark" ? cleanDarkTheme : cleanLightTheme}
          customStyle={{
            margin: 0,
            padding: "16px 18px",
            fontSize: "15px",
            lineHeight: "1.65",
            borderRadius: 0,
            border: "none",
            backgroundColor: theme === "dark" ? "#11141d" : "#fafafa",
            fontFamily: CODE_FONT_STACK,
            width: "100%",
            boxSizing: "border-box",
          }}
          codeTagProps={{
            className: "syntax-highlighter-code",
            style: {
              fontSize: "inherit",
              lineHeight: "inherit",
              fontFamily: "inherit",
              background: "transparent",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "0px",
              padding: "0px",
              boxShadow: "none",
              display: "block",
              width: "100%",
            },
          }}
          showLineNumbers={true}
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "1.25em",
            color: theme === "dark" ? "#525e75" : "#94a3b8",
            textAlign: "right",
            userSelect: "none",
            border: "none",
            background: "transparent",
            backgroundColor: "transparent",
            fontFamily: "inherit",
            fontSize: "inherit",
            lineHeight: "inherit",
            fontStyle: "normal",
          }}
          wrapLongLines={false}
        >
          {value.trimEnd()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
