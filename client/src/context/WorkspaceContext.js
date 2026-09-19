import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import API from "../utils/API";

const ACTIVE_WORKSPACE_KEY = "activeWorkspaceId";
const WorkspaceContext = createContext();

export function WorkspaceProvider({ enabled, children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("");
  const [loading, setLoading] = useState(enabled);

  const switchWorkspace = useCallback((workspaceId) => {
    setActiveWorkspaceId(workspaceId);
    localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    API.getWorkspaces()
      .then((response) => {
        const items = response.data.data || [];
        const stored = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
        const active =
          items.find((workspace) => workspace._id === stored) ||
          items.find((workspace) => workspace.isDefault) ||
          items[0];

        setWorkspaces(items);
        if (active) switchWorkspace(active._id);
      })
      .catch(() => {
        // With no workspace id, expense APIs use Personal.
      })
      .finally(() => setLoading(false));
  }, [enabled, switchWorkspace]);

  const createWorkspace = useCallback(
    async (name) => {
      const response = await API.createWorkspace(name);
      const workspace = response.data.data;
      setWorkspaces((current) => [...current, workspace]);
      switchWorkspace(workspace._id);
      return workspace;
    },
    [switchWorkspace],
  );

  const activeWorkspace = useMemo(
    () =>
      workspaces.find((workspace) => workspace._id === activeWorkspaceId) ||
      null,
    [workspaces, activeWorkspaceId],
  );

  const value = useMemo(
    () => ({
      workspaces,
      activeWorkspace,
      activeWorkspaceId,
      loading,
      switchWorkspace,
      createWorkspace,
    }),
    [
      workspaces,
      activeWorkspace,
      activeWorkspaceId,
      loading,
      switchWorkspace,
      createWorkspace,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
}
