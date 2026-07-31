import type { Metadata } from "next";
import { listCompanies, listMessages, listProjects } from "@/lib/db";
import { MessagesInbox, type Thread } from "@/components/messages-inbox";

export const metadata: Metadata = {
  title: "Messages — CrewMatrix",
  description: "Conversations attached to the project they are about.",
};

export default async function MessagesPage() {
  const [projects, companies] = await Promise.all([listProjects(), listCompanies()]);

  const threads: Thread[] = [];

  // A thread is a project that has messages on it — conversations do not float
  // free of the work they are about.
  for (const p of projects) {
    const msgs = await listMessages(p.id);
    if (!msgs.length) continue;

    const contractor = companies.find((c) => c.id === p.contractorId);
    const otherId = msgs.find((m) => m.fromId !== p.contractorId)?.fromId;
    const other = companies.find((c) => c.id === otherId);

    threads.push({
      projectId: p.id,
      projectTitle: p.title,
      trade: p.trade,
      counterparty: other?.name ?? contractor?.name ?? "Unknown",
      counterpartyAccent: other?.accent ?? contractor?.accent ?? "#f2a33c",
      messages: msgs.map((m) => ({
        id: m.id,
        body: m.body,
        sentAt: m.sentAt,
        fromContractor: m.fromId === p.contractorId,
        fromName: companies.find((c) => c.id === m.fromId)?.name ?? "—",
      })),
    });
  }

  return <MessagesInbox threads={threads} />;
}
