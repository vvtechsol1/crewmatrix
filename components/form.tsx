import { cloneElement, isValidElement, useId } from "react";
import clsx from "clsx";

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink-300">
      {children}
    </label>
  );
}

const fieldCls =
  "w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2.5 text-sm text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-hi-500 focus:ring-1 focus:ring-hi-500/40";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(fieldCls, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(fieldCls, "min-h-28 resize-y", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx(fieldCls, props.className)} />;
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  const generatedId = useId();
  const messageId = `${htmlFor ?? generatedId}-message`;
  const control = isValidElement<React.InputHTMLAttributes<HTMLInputElement>>(children)
    ? cloneElement(children, {
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error || hint ? messageId : undefined,
      })
    : children;

  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {control}
      {error ? (
        <p id={messageId} className="mt-1.5 text-xs font-medium text-bad-500">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="mt-1.5 text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "quiet" }) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-hi-500 text-ink-950 hover:bg-hi-400",
        variant === "ghost" && "border border-ink-700 text-ink-100 hover:bg-ink-800",
        variant === "quiet" && "text-ink-300 hover:text-ink-100",
        className,
      )}
    />
  );
}

/** Compact progress indicator for async form actions. */
export function ButtonSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={clsx("size-4 animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Steps({ current, labels }: { current: number; labels: string[] }) {
  return (
    <ol className="flex items-center gap-2">
      {labels.map((l, i) => {
        const state = i < current ? "done" : i === current ? "now" : "todo";
        return (
          <li key={l} className="flex flex-1 items-center gap-2">
            <div className="flex-1">
              <div
                className={clsx(
                  "h-1 rounded-full transition-colors",
                  state === "todo" ? "bg-ink-800" : "bg-hi-500",
                )}
              />
              <div
                className={clsx(
                  "mt-2 text-xs",
                  state === "now" ? "font-medium text-ink-100" : "text-ink-400",
                )}
              >
                {l}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Selectable card — used for role choice, trade picking, plan choice. */
export function ChoiceCard({
  selected,
  onClick,
  title,
  body,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  body?: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        "w-full rounded-xl border p-5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-hi-500",
        selected
          ? "border-hi-500 bg-hi-500/[0.07] ring-1 ring-hi-500/30"
          : "border-ink-800 bg-ink-900 hover:border-ink-600",
      )}
    >
      {icon && (
        <span
          className={clsx(
            "mb-3 grid size-9 place-items-center rounded-lg",
            selected ? "bg-hi-500 text-ink-950" : "bg-ink-800 text-ink-300",
          )}
        >
          {icon}
        </span>
      )}
      <div className="font-medium">{title}</div>
      {body && <p className="mt-1.5 text-sm leading-relaxed text-ink-400">{body}</p>}
    </button>
  );
}
