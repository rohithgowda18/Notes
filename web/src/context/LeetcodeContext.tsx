import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { RepoFile, RepoTree } from "../types";
import { fetchLeetcodeTree, clearLeetcodeCache } from "../services/leetcode";

interface LeetcodeContextType {
  tree: RepoTree | null;
  allFiles: RepoFile[];
  loading: boolean;
  error: string | null;
  lastSynced: number | null;
  refresh: () => Promise<void>;
}

const LeetcodeContext = createContext<LeetcodeContextType | undefined>(undefined);

export const LeetcodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tree, setTree] = useState<RepoTree | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<number | null>(null);

  const loadTree = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      if (forceRefresh) {
        clearLeetcodeCache();
      }
      const result = await fetchLeetcodeTree(forceRefresh);
      setTree(result.tree);
      setLastSynced(result.lastSynced);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load LeetCode solutions";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTree(false);
  }, [loadTree]);

  const refresh = useCallback(async () => {
    await loadTree(true);
  }, [loadTree]);

  return (
    <LeetcodeContext.Provider
      value={{
        tree,
        allFiles: tree?.allFiles || [],
        loading,
        error,
        lastSynced,
        refresh,
      }}
    >
      {children}
    </LeetcodeContext.Provider>
  );
};

export function useLeetcode(): LeetcodeContextType {
  const context = useContext(LeetcodeContext);
  if (!context) {
    throw new Error("useLeetcode must be used within a LeetcodeProvider");
  }
  return context;
}
