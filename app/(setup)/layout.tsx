import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-800">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <BrandLogo imageClassName="size-9" />
          </Link>
          <Link href="/login" className="text-sm text-ink-400 hover:text-ink-100">
            Save and finish later
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
