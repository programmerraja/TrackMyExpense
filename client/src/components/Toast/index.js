import React, { useState } from "react";

export const ToastContext = React.createContext();

const TOAST_CLASS = {
  success: "border-money-in/30 text-money-in",
  error: "border-money-out/30 text-money-out",
  info: "border-money-tax/30 text-money-tax",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const addToast = (message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[200] flex flex-col items-center gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              "pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3",
              "rounded-xl border bg-ink-800 px-4 py-3 text-sm font-medium shadow-2xl",
              TOAST_CLASS[toast.type] || TOAST_CLASS.info,
            ].join(" ")}
            role="status"
          >
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-lg leading-none text-slate-500 hover:text-slate-200"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
