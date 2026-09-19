import React from "react";

function SquareLoader({ loading, msg, style }) {
  if (!loading) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-ink-950/80 backdrop-blur-sm"
      style={style}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-brand-500" />
        <p className="text-sm font-medium text-slate-400">
          {msg || "Loading…"}
        </p>
      </div>
    </div>
  );
}

export default SquareLoader;
