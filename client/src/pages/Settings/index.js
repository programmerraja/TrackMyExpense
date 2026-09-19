import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";

import { useToast } from "../../components/Toast";
import API from "../../utils/API";

const LINKS = [
  {
    to: "/import-rules",
    label: "Import rules",
    detail: "Edit what each bank payee becomes",
  },
  { to: "/investment", label: "Investments", detail: "Entries and totals" },
];

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default function Settings() {
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    baseSalaryLimit: Number(localStorage.getItem("baseSalaryLimit")) || 0,
    autoAllocationVault:
      localStorage.getItem("autoAllocationVault") || "emergency",
  });

  const save = useCallback(() => {
    setSaving(true);
    API.updateSettings(settings)
      .then(() => {
        localStorage.setItem("baseSalaryLimit", settings.baseSalaryLimit);
        localStorage.setItem("autoAllocationVault", settings.autoAllocationVault);
        addToast("Salary rule saved", "success");
        setSaving(false);
      })
      .catch(() => {
        addToast("Could not save salary rule", "error");
        setSaving(false);
      });
  }, [settings, addToast]);

  return (
    <main className="page">
      <header className="mb-5">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Salary split and less-used tools</p>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="card p-4 sm:p-5">
          <div className="mb-5">
            <h2 className="font-semibold">Salary split</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Keep a fixed amount as spendable salary. Any extra goes directly
              to your emergency fund.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="salary-limit" className="label">
                Spendable salary
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                  ₹
                </span>
                <input
                  id="salary-limit"
                  type="number"
                  inputMode="numeric"
                  value={settings.baseSalaryLimit || ""}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      baseSalaryLimit: Number(event.target.value),
                    })
                  }
                  placeholder="85000"
                  className="field pl-7"
                />
              </div>
            </div>

            <div>
              <label htmlFor="surplus-account" className="label">
                Put the extra into
              </label>
              <select
                id="surplus-account"
                value={settings.autoAllocationVault}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    autoAllocationVault: event.target.value,
                  })
                }
                className="field"
              >
                <option value="emergency">Emergency fund</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex justify-end border-t border-white/5 pt-4">
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? "Saving…" : "Save salary rule"}
            </button>
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="border-b border-white/5 px-4 py-3">
            <h2 className="font-semibold">More tools</h2>
          </div>
          <div className="divide-y divide-white/5">
            {LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between gap-3 px-4 py-3.5 text-slate-100 no-underline transition hover:bg-white/[0.035]"
              >
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
                </div>
                <span className="text-slate-500">
                  <ArrowIcon />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
