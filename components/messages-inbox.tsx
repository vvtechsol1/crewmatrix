"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Send } from "lucide-react";

export interface ThreadMessage {
  id: string;
  body: string;
  sentAt: string;
  fromContractor: boolean;
  fromName: string;
}

export interface Thread {
  projectId: string;
  projectTitle: string;
  trade: string;
  counterparty: string;
  counterpartyAccent: string;
  messages: ThreadMessage[];
}

const time = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const initials = (n: string) =>
  n.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export function MessagesInbox({ threads }: { threads: Thread[] }) {
  const [activeId, setActiveId] = useState(threads[0]?.projectId);
  const [draft, setDraft] = useState("");
  const [sentLocally, setSentLocally] = useState<Record<string, ThreadMessage[]>>({});

  const active = threads.find((t) => t.projectId === activeId);
  const extra = active ? (sentLocally[active.projectId] ?? []) : [];

  if (!threads.length) {
    return (
      <div className="p-10 text-center text-ink-400">No conversations yet.</div>
    );
  }

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 md:grid-cols-[19rem_1fr]">
      {/* thread list */}
      <div className="overflow-y-auto border-r border-ink-800">
        {threads.map((t) => (
          <button
            key={t.projectId}
            onClick={() => setActiveId(t.projectId)}
            className={clsx(
              "flex w-full gap-3 border-b border-ink-800 p-4 text-left transition-colors",
              t.projectId === activeId ? "bg-ink-800/60" : "hover:bg-ink-900",
            )}
          >
            <span
              className="grid size-9 shrink-0 place-items-center rounded-lg text-xs font-semibold text-ink-950"
              style={{ background: t.counterpartyAccent }}
            >
              {initials(t.counterparty)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium">{t.counterparty}</span>
                <span className="shrink-0 text-xs text-ink-600">
                  {new Date(t.messages[t.messages.length - 1].sentAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="truncate text-xs text-ink-400">{t.projectTitle}</div>
              <div className="mt-1 truncate text-xs text-ink-600">
                {t.messages[t.messages.length - 1].body}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* conversation */}
      {active && (
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center gap-3 border-b border-ink-800 px-5 py-3.5">
            <span
              className="grid size-9 shrink-0 place-items-center rounded-lg text-xs font-semibold text-ink-950"
              style={{ background: active.counterpartyAccent }}
            >
              {initials(active.counterparty)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{active.counterparty}</div>
              <Link
                href={`/projects/${active.projectId}`}
                className="truncate text-xs text-ink-400 hover:text-hi-500"
              >
                {active.projectTitle} ↗
              </Link>
            </div>
            <span className="ml-auto rounded-md border border-hi-500/30 bg-hi-500/10 px-2 py-0.5 text-xs font-medium text-hi-500">
              {active.trade}
            </span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {[...active.messages, ...extra].map((m) => (
              <div
                key={m.id}
                className={clsx("flex", m.fromContractor ? "justify-start" : "justify-end")}
              >
                <div
                  className={clsx(
                    "max-w-lg rounded-xl px-4 py-3",
                    m.fromContractor ? "bg-ink-800" : "bg-hi-500/12 ring-1 ring-hi-500/20",
                  )}
                >
                  <div className="text-xs text-ink-400">
                    {m.fromName} · {time(m.sentAt)}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed">{m.body}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            className="flex gap-2 border-t border-ink-800 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              setSentLocally((prev) => ({
                ...prev,
                [active.projectId]: [
                  ...(prev[active.projectId] ?? []),
                  {
                    id: `local-${Date.now()}`,
                    body: draft.trim(),
                    sentAt: new Date().toISOString(),
                    fromContractor: false,
                    fromName: "You",
                  },
                ],
              }));
              setDraft("");
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Message about ${active.projectTitle.slice(0, 34)}…`}
              className="flex-1 rounded-md border border-ink-700 bg-ink-900 px-3.5 py-2.5 text-sm outline-none placeholder:text-ink-600 focus:border-hi-500"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-hi-500 px-4 text-sm font-medium text-white hover:bg-hi-400"
            >
              <Send size={15} />
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
