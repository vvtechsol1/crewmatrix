import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-32 text-center">
      <div className="font-mono text-sm text-hi-500">404</div>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">That listing is no longer up</h1>
      <p className="mt-3 text-ink-400">
        Projects come down once they are awarded, and companies can pause their profile between jobs.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/find-work">Browse open work</ButtonLink>
        <ButtonLink href="/find-pros" variant="ghost">
          Find subcontractors
        </ButtonLink>
      </div>
    </div>
  );
}
