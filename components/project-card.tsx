import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import type { Company, Project } from "@/lib/types";
import { moneyRange, shortDate, sinceLabel } from "@/lib/format";
import { Avatar, Card, Pill } from "@/components/ui";

const statusTone = {
  open: "ok",
  awarded: "accent",
  in_progress: "warn",
  complete: "neutral",
} as const;

const statusLabel = {
  open: "Accepting bids",
  awarded: "Awarded",
  in_progress: "In progress",
  complete: "Complete",
} as const;

export function ProjectCard({ project, contractor }: { project: Project; contractor?: Company }) {
  return (
    <Card className="group p-5 transition-colors hover:border-ink-600">
      <div className="flex items-start gap-4">
        {contractor && <Avatar company={contractor} size={42} />}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="accent">{project.trade}</Pill>
            <Pill tone={statusTone[project.status]}>{statusLabel[project.status]}</Pill>
            <span className="text-xs text-ink-400">posted {sinceLabel(project.postedAt)}</span>
          </div>

          <h3 className="mt-2 text-base font-medium leading-snug">
            <Link href={`/projects/${project.id}`} className="hover:text-hi-500">
              {project.title}
            </Link>
          </h3>

          {contractor && (
            <div className="mt-1 text-sm text-ink-400">
              {contractor.name} · {project.city}, {project.state}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-300">
            <span className="font-medium text-ink-100">{moneyRange(project.budgetLow, project.budgetHigh)}</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} className="text-ink-400" />
              starts {shortDate(project.startDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="text-ink-400" />
              {project.distanceMiles} mi
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} className="text-ink-400" />
              {project.bidCount} bids
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
