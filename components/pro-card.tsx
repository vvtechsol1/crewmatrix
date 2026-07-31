import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import type { Company } from "@/lib/types";
import { Avatar, Card, Pill, Rating, VerifyBadge } from "@/components/ui";

export function ProCard({ company }: { company: Company }) {
  return (
    <Card className="p-5 transition-colors hover:border-ink-600">
      <div className="flex items-start gap-4">
        <Avatar company={company} size={46} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="font-medium">
              <Link href={`/pros/${company.id}`} className="hover:text-hi-500">
                {company.name}
              </Link>
            </h3>
            <Rating value={company.rating} count={company.reviewCount} />
          </div>

          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {company.trades.map((t) => (
              <Pill key={t} tone="accent">
                {t}
              </Pill>
            ))}
          </div>

          <p className="mt-3 line-clamp-2 text-sm text-ink-400">{company.bio}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-300">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="text-ink-400" />
              {company.city}, {company.state} · {company.serviceRadiusMiles} mi radius
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} className="text-ink-400" />
              crew of {company.crewSize}
            </span>
            <span>{company.completedJobs} jobs completed</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <VerifyBadge status={company.license.status} label="Licence" />
            <VerifyBadge status={company.insurance.status} label="Insurance" />
          </div>
        </div>
      </div>
    </Card>
  );
}
