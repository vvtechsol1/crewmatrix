import Image from "next/image";
import Link from "next/link";

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-800">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Image
              src="/brand/crewmatrix-monogram.png"
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 object-contain"
            />
            <span className="font-display font-bold tracking-[-.035em]">CrewMatrix</span>
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
