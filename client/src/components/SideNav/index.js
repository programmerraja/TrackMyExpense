import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useToast } from "../Toast";

const icon = (path) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[21px] w-[21px] shrink-0"
  >
    {path}
  </svg>
);

// The first four also make up the phone bottom bar; the rest live behind "More".
const NAV_ITEMS = [
  {
    path: "/dashboard",
    label: "Home",
    icon: icon(
      <>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </>,
    ),
  },
  {
    path: "/expense",
    label: "Spending",
    icon: icon(
      <>
        <path d="M3 17l6-6 4 4 7-7" />
        <path d="M14 8h6v6" />
      </>,
    ),
  },
  {
    path: "/people",
    label: "People",
    icon: icon(
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M2.5 20c0-3.3 2.9-5.2 6.5-5.2s6.5 1.9 6.5 5.2" />
        <path d="M17 11.2A3 3 0 0 0 17 5.4" />
        <path d="M18.5 19.8c.6-.2 3-.7 3-2.6 0-1.7-1.5-2.7-3.4-3" />
      </>,
    ),
  },
  {
    path: "/bank-statement",
    label: "Import",
    icon: icon(
      <>
        <path d="M12 3v11" />
        <path d="m8 10 4 4 4-4" />
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      </>,
    ),
  },
  {
    path: "/income",
    label: "Income",
    icon: icon(
      <>
        <path d="M12 3v18" />
        <path d="M17 7.5C17 5.6 14.8 4.5 12 4.5S7 5.6 7 7.5s2.2 2.8 5 3.4 5 1.5 5 3.4-2.2 3-5 3-5-1.1-5-3" />
      </>,
    ),
  },
  {
    path: "/incometax",
    label: "Tax",
    icon: icon(
      <>
        <path d="M6 3h9l5 5v13H6z" />
        <path d="M14 3v6h6" />
        <path d="M9.5 16.5 15 11" />
        <circle cx="10" cy="12" r="1" />
        <circle cx="14.5" cy="16" r="1" />
      </>,
    ),
  },
  {
    path: "/tracking",
    label: "Tracking",
    icon: icon(
      <>
        <path d="M3 3v16.5a1.5 1.5 0 0 0 1.5 1.5H21" />
        <path d="m7 15 3.5-4 3 2.5L18 8" />
      </>,
    ),
  },
  {
    path: "/search",
    label: "Search",
    icon: icon(
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>,
    ),
  },
  {
    path: "/settings",
    label: "Settings",
    icon: icon(
      <>
        <circle cx="12" cy="12" r="3.2" />
        <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
      </>,
    ),
  },
];

const PRIMARY_COUNT = 4;

const activeClasses = "bg-brand-500 text-white";
const idleClasses = "text-slate-400 hover:bg-white/[0.07] hover:text-slate-100";

const MoreIcon = () =>
  icon(
    <>
      <circle cx="5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="19" cy="12" r="1.4" />
    </>,
  );

function WorkspaceDialog({ onClose }) {
  const {
    workspaces,
    activeWorkspaceId,
    switchWorkspace,
    createWorkspace,
  } = useWorkspace();
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await createWorkspace(name.trim());
      addToast("Workspace created", "success");
      onClose();
    } catch (error) {
      addToast(
        error.response?.data?.error || "Could not create workspace",
        "error",
      );
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <section
        className="w-full max-w-sm rounded-t-2xl border border-white/10 bg-ink-900 p-4 sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 id="workspace-title" className="font-semibold">
              Workspaces
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Separate your income and spending
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="space-y-2">
          {workspaces.map((workspace) => (
            <button
              key={workspace._id}
              type="button"
              onClick={() => {
                switchWorkspace(workspace._id);
                onClose();
              }}
              className={[
                "flex h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-semibold transition",
                workspace._id === activeWorkspaceId
                  ? "bg-brand-500/15 text-brand-400"
                  : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]",
              ].join(" ")}
            >
              <span className="truncate">{workspace.name}</span>
              {workspace._id === activeWorkspaceId && <span>✓</span>}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-4 border-t border-white/5 pt-4">
          <label htmlFor="workspace-name" className="label">
            New workspace
          </label>
          <div className="flex gap-2">
            <input
              id="workspace-name"
              className="field min-w-0"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Side business"
              maxLength="40"
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={saving || !name.trim()}
            >
              {saving ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function SideNav() {
  const [showMore, setShowMore] = useState(false);
  const [showWorkspaces, setShowWorkspaces] = useState(false);
  const { activeWorkspace, loading: workspaceLoading } = useWorkspace();

  const railLink = ({ isActive }) =>
    [
      "flex items-center gap-3 rounded-lg px-3 text-sm font-semibold no-underline transition",
      "h-10 w-10 justify-center lg:h-10 lg:w-full lg:justify-start",
      isActive ? activeClasses : idleClasses,
    ].join(" ");

  const barLink = ({ isActive }) =>
    [
      "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 no-underline transition",
      isActive ? "text-brand-400" : "text-slate-500",
    ].join(" ");

  return (
    <>
      {/* Desktop: icon rail that grows into a labelled sidebar on wide screens. */}
      <nav className="fixed inset-y-0 left-0 z-40 hidden w-[4.5rem] flex-col gap-1 border-r border-white/[0.06] bg-ink-900 px-3 py-4 md:flex lg:w-60">
        <div className="mb-4 flex h-10 items-center gap-2.5 px-1 lg:px-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
            ₹
          </span>
          <span className="hidden truncate font-bold tracking-tight lg:block">
            TrackMyExpense
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowWorkspaces(true)}
          className="mb-3 flex h-11 w-10 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-slate-300 transition hover:bg-white/[0.07] lg:w-full lg:justify-between lg:px-3"
          title="Switch workspace"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-500/15 text-xs font-bold uppercase text-brand-400">
              {(activeWorkspace?.name || "W").charAt(0)}
            </span>
            <span className="hidden truncate text-sm font-semibold lg:block">
              {workspaceLoading
                ? "Loading…"
                : activeWorkspace?.name || "Personal"}
            </span>
          </span>
          <span className="hidden text-slate-500 lg:block">⌄</span>
        </button>

        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={railLink}
            title={item.label}
            end={item.path === "/dashboard"}
          >
            {item.icon}
            <span className="hidden lg:block">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Phone: four primary tabs plus an overflow sheet for everything else. */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch gap-1 border-t border-white/[0.06] bg-ink-900/95 px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        {NAV_ITEMS.slice(0, PRIMARY_COUNT).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={barLink}
            end={item.path === "/dashboard"}
            onClick={() => setShowMore(false)}
          >
            {item.icon}
            <span className="text-[10px] font-semibold">{item.label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setShowMore((open) => !open)}
          className={[
            "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 transition",
            showMore ? "text-brand-400" : "text-slate-500",
          ].join(" ")}
        >
          <MoreIcon />
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </nav>

      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setShowMore(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-white/10 bg-ink-900 p-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
            <button
              type="button"
              onClick={() => {
                setShowMore(false);
                setShowWorkspaces(true);
              }}
              className="mb-3 flex h-12 w-full items-center justify-between rounded-xl bg-brand-500/10 px-3 text-left"
            >
              <span>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Workspace
                </span>
                <span className="block text-sm font-semibold text-brand-400">
                  {activeWorkspace?.name || "Personal"}
                </span>
              </span>
              <span className="text-sm font-semibold text-slate-400">
                Switch
              </span>
            </button>
            <div className="grid grid-cols-3 gap-2">
              {NAV_ITEMS.slice(PRIMARY_COUNT).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMore(false)}
                  className={({ isActive }) =>
                    [
                      "flex flex-col items-center gap-2 rounded-xl px-2 py-4 text-xs font-semibold no-underline transition",
                      isActive ? activeClasses : "bg-white/[0.04] text-slate-300",
                    ].join(" ")
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
      {showWorkspaces && (
        <WorkspaceDialog onClose={() => setShowWorkspaces(false)} />
      )}
    </>
  );
}
