import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject, listProjects } from "@/lib/db";
import { BidFlow } from "@/components/bid-flow";

export async function generateStaticParams() {
  const all = await listProjects({ status: "open" });
  return all.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  return { title: project ? `Bid on ${project.title} — CrewMatrix` : "Submit a bid — CrewMatrix" };
}

export default async function BidPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <BidFlow
      projectId={project.id}
      projectTitle={project.title}
      budgetLow={project.budgetLow}
      budgetHigh={project.budgetHigh}
      feePct={project.platformFeePct}
    />
  );
}
