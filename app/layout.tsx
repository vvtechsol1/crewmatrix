import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://crewmatrix.vvtechsol1.workers.dev"),
  title: "CrewMatrix — Construction Bidding Platform for Contractors & Subcontractors",
  description:
    "CrewMatrix is a construction bidding marketplace where general contractors post projects and licensed subcontractors win work nearby — verified licences and insurance, radius-matched bids across 12 trades, and milestone payouts on one record.",
  keywords: [
    "construction bidding platform",
    "find subcontractors",
    "construction marketplace",
    "general contractor software",
    "subcontractor jobs",
    "construction bid management",
    "hire licensed subcontractors",
    "construction project bidding",
  ],
  openGraph: {
    type: "website",
    siteName: "CrewMatrix",
    title: "CrewMatrix — Construction Bidding Platform",
    description:
      "General contractors post projects, licensed subcontractors bid on work inside their radius, and the payout runs on the same record.",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "CrewMatrix — Construction Bidding Platform",
    description:
      "Post construction projects, take radius-matched bids from verified crews, and pay through the platform.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-950 text-ink-100">{children}</body>
    </html>
  );
}
