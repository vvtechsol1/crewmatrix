export type Role = "contractor" | "subcontractor";

export type Trade =
  | "Framing"
  | "Electrical"
  | "Plumbing"
  | "HVAC"
  | "Drywall"
  | "Concrete"
  | "Roofing"
  | "Painting"
  | "Masonry"
  | "Excavation"
  | "Flooring"
  | "Landscaping";

export type VerificationStatus = "verified" | "pending" | "expired" | "none";

export interface Company {
  id: string;
  role: Role;
  name: string;
  contact: string;
  trades: Trade[];
  city: string;
  state: string;
  /** miles they will travel from their base — drives marketplace matching */
  serviceRadiusMiles: number;
  crewSize: number;
  yearsInBusiness: number;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  license: { number: string; status: VerificationStatus; expires: string };
  insurance: { carrier: string; status: VerificationStatus; coverage: number; expires: string };
  bio: string;
  /** deterministic accent so avatars stay stable between renders */
  accent: string;
}

export type ProjectStatus = "open" | "awarded" | "in_progress" | "complete";

export interface Project {
  id: string;
  contractorId: string;
  title: string;
  trade: Trade;
  city: string;
  state: string;
  /** straight-line distance used by the matching filter, in miles */
  distanceMiles: number;
  budgetLow: number;
  budgetHigh: number;
  startDate: string;
  durationWeeks: number;
  status: ProjectStatus;
  scope: string;
  requirements: string[];
  postedAt: string;
  bidCount: number;
  /** platform fee % applied to the awarded amount on payout */
  platformFeePct: number;
}

export type BidStatus = "submitted" | "shortlisted" | "awarded" | "declined";

export interface Bid {
  id: string;
  projectId: string;
  subcontractorId: string;
  amount: number;
  crewSize: number;
  startAvailable: string;
  durationWeeks: number;
  note: string;
  status: BidStatus;
  submittedAt: string;
}

export interface Message {
  id: string;
  projectId: string;
  fromId: string;
  toId: string;
  body: string;
  sentAt: string;
}

export type PayoutStatus = "pending" | "in_transit" | "paid" | "held";

export interface Payout {
  id: string;
  projectId: string;
  subcontractorId: string;
  gross: number;
  feePct: number;
  status: PayoutStatus;
  releasedAt: string | null;
}

export interface PlanTier {
  id: "starter" | "pro" | "crew";
  name: string;
  priceMonthly: number;
  priceYearly: number;
  forRole: Role | "both";
  blurb: string;
  features: string[];
  featured?: boolean;
  /** Stripe Price IDs live in env, never in source */
  priceEnvKey: string;
}
