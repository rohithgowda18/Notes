import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { RepoFile, RepoTree } from "../types";
import {
  clearStudyCache,
  fetchRepositoryTree,
  getStoredGitHubToken,
  setStoredGitHubToken,
} from "../services/github";

interface RepoContextType {
  tree: RepoTree | null;
  allFiles: RepoFile[];
  loading: boolean;
  error: string | null;
  lastSynced: number | null;
  isLocal: boolean;
  token: string;
  updateToken: (token: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const RepoContext = createContext<RepoContextType | undefined>(undefined);

export const RepoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tree, setTree] = useState<RepoTree | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<number | null>(null);
  const [isLocal, setIsLocal] = useState<boolean>(false);
  const [token, setToken] = useState<string>(getStoredGitHubToken());

  const loadTree = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      if (forceRefresh) {
        clearStudyCache();
      }
      const result = await fetchRepositoryTree(forceRefresh);
      setTree(result.tree);
      setLastSynced(result.lastSynced);
      setIsLocal(result.isLocal);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load study notes";
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

  const updateToken = useCallback(
    async (newToken: string) => {
      setStoredGitHubToken(newToken);
      setToken(newToken);
      await loadTree(true);
    },
    [loadTree]
  );

  return (
    <RepoContext.Provider
      value={{
        tree,
        allFiles: tree?.allFiles || [],
        loading,
        error,
        lastSynced,
        isLocal,
        token,
        updateToken,
        refresh,
      }}
    >
      {children}
    </RepoContext.Provider>
  );
};

export function useRepo(): RepoContextType {
  const context = useContext(RepoContext);
  if (!context) {
    throw new Error("useRepo must be used within a RepoProvider");
  }
  return context;
}
