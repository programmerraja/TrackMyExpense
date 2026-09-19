import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { AddButton, SquareLoader } from "../../components";
import { amountClass, EXPENSE_TYPE } from "../../constants/expense";
import API from "../../utils/API";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

function PeopleRow({ person }) {
  const theyOweMe = person.net < 0;
  const amount = Math.abs(person.net);
  const settled = amount === 0;

  return (
    <Link
      to={`/debt?name=${encodeURIComponent(person._id)}&all=true`}
      className="card flex items-center justify-between gap-3 p-4 text-slate-100 no-underline transition hover:border-white/15 hover:bg-ink-800"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 font-bold uppercase text-brand-400">
          {(person._id || "?").charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold capitalize">{person._id}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {person.entries} {person.entries === 1 ? "entry" : "entries"} ·{" "}
            {formatDate(person.lastDate)}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={[
            "font-bold",
            settled ? "text-slate-500" : amountClass(person.net),
          ].join(" ")}
        >
          ₹{API.numberWithCommas(amount) || 0}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {settled ? "Settled" : theyOweMe ? "Owes me" : "I owe"}
        </p>
      </div>
    </Link>
  );
}

export default function People() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.getPeople()
      .then((res) => {
        setPeople(res.data.data || []);
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load people. Please try again.");
        setLoading(false);
      });
  }, [refresh]);

  const totals = useMemo(
    () =>
      people.reduce(
        (result, person) => {
          if (person.net < 0) result.owedToMe += Math.abs(person.net);
          if (person.net > 0) result.iOwe += person.net;
          return result;
        },
        { owedToMe: 0, iOwe: 0 },
      ),
    [people],
  );

  const sorted = useMemo(
    () =>
      [...people].sort((a, b) => Math.abs(b.net) - Math.abs(a.net)),
    [people],
  );

  return (
    <>
      <SquareLoader loading={loading} msg="Loading people..." />
      <AddButton
        type={EXPENSE_TYPE.DEBT}
        show={showForm}
        setShowFrom={setShowForm}
        setAPICall={setRefresh}
        nameSuggestions={people.map((person) => person._id)}
      />

      <main className="page">
        <header className="mb-5">
          <h1 className="page-title">People</h1>
          <p className="page-subtitle">Money you have lent and borrowed</p>
        </header>

        {!error && (
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="card border-l-4 border-l-money-out p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Owed to me
              </p>
              <p className="mt-1 text-2xl font-bold text-money-out">
                ₹{API.numberWithCommas(totals.owedToMe) || 0}
              </p>
            </div>
            <div className="card border-l-4 border-l-money-in p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                I owe
              </p>
              <p className="mt-1 text-2xl font-bold text-money-in">
                ₹{API.numberWithCommas(totals.iOwe) || 0}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="card p-8 text-center">
            <p className="font-semibold">Could not load people</p>
            <p className="mt-1 text-sm text-slate-400">{error}</p>
            <button
              onClick={() => setRefresh((value) => !value)}
              className="btn-primary mt-4"
            >
              Retry
            </button>
          </div>
        )}

        {!error && !loading && sorted.length === 0 && (
          <div className="card p-10 text-center">
            <p className="text-4xl">
              <span role="img" aria-label="Handshake">
                🤝
              </span>
            </p>
            <p className="mt-3 font-semibold">Nobody yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Add money lent or borrowed to start tracking
            </p>
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
              Add person
            </button>
          </div>
        )}

        {sorted.length > 0 && (
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map((person) => (
              <PeopleRow key={person._id} person={person} />
            ))}
          </section>
        )}
      </main>
    </>
  );
}
