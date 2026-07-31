import type { Bid, Company, Message, Payout, Project } from "@/lib/types";

/**
 * Postgres speaks snake_case and returns flat rows; the app speaks camelCase and
 * likes its licence and insurance grouped. Mapping happens here, once, so no
 * component ever has to know which shape it is holding.
 */

type Row = Record<string, unknown>;

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
const num = (v: unknown, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

export function toCompany(r: Row): Company {
  return {
    id: str(r.id),
    role: r.role === "contractor" ? "contractor" : "subcontractor",
    name: str(r.name),
    contact: str(r.contact),
    trades: arr(r.trades) as Company["trades"],
    city: str(r.city),
    state: str(r.state),
    serviceRadiusMiles: num(r.service_radius_miles, 50),
    crewSize: num(r.crew_size),
    yearsInBusiness: num(r.years_in_business),
    rating: num(r.rating),
    reviewCount: num(r.review_count),
    completedJobs: num(r.completed_jobs),
    license: {
      number: str(r.license_number, "—"),
      status: (str(r.license_status, "none") as Company["license"]["status"]),
      expires: str(r.license_expires, ""),
    },
    insurance: {
      carrier: str(r.insurance_carrier, "—"),
      status: (str(r.insurance_status, "none") as Company["insurance"]["status"]),
      coverage: num(r.insurance_coverage),
      expires: str(r.insurance_expires, ""),
    },
    bio: str(r.bio),
    accent: str(r.accent, "#f2a33c"),
  };
}

export function toProject(r: Row): Project {
  return {
    id: str(r.id),
    contractorId: str(r.contractor_id),
    title: str(r.title),
    trade: str(r.trade) as Project["trade"],
    city: str(r.city),
    state: str(r.state),
    distanceMiles: num(r.distance_miles),
    budgetLow: num(r.budget_low),
    budgetHigh: num(r.budget_high),
    startDate: str(r.start_date),
    durationWeeks: num(r.duration_weeks),
    status: (str(r.status, "open") as Project["status"]),
    scope: str(r.scope),
    requirements: arr(r.requirements),
    postedAt: str(r.posted_at),
    bidCount: num(r.bid_count),
    platformFeePct: num(r.platform_fee_pct, 4),
  };
}

export function toBid(r: Row): Bid {
  return {
    id: str(r.id),
    projectId: str(r.project_id),
    subcontractorId: str(r.subcontractor_id),
    amount: num(r.amount),
    crewSize: num(r.crew_size),
    startAvailable: str(r.start_available),
    durationWeeks: num(r.duration_weeks),
    note: str(r.note),
    status: (str(r.status, "submitted") as Bid["status"]),
    submittedAt: str(r.submitted_at),
  };
}

export function toMessage(r: Row): Message {
  return {
    id: str(r.id),
    projectId: str(r.project_id),
    fromId: str(r.from_id),
    toId: str(r.to_id),
    body: str(r.body),
    sentAt: str(r.sent_at),
  };
}

export function toPayout(r: Row): Payout {
  return {
    id: str(r.id),
    projectId: str(r.project_id),
    subcontractorId: str(r.subcontractor_id),
    gross: num(r.gross),
    feePct: num(r.fee_pct, 4),
    status: (str(r.status, "pending") as Payout["status"]),
    releasedAt: typeof r.released_at === "string" ? r.released_at : null,
  };
}
