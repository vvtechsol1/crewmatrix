"use client";

import { useState } from "react";
import { Check, UserPlus, X } from "lucide-react";
import { Button, Field, Input, Select } from "@/components/form";

export function InviteTeammate() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Estimator");
  const [error, setError] = useState<string>();
  const [sentTo, setSentTo] = useState<string>();

  if (sentTo) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-ok-500/30 bg-ok-500/10 px-3 py-2 text-sm text-ok-500">
        <Check size={15} /> Invite sent to {sentTo}
      </span>
    );
  }

  if (!open) {
    return (
      <Button variant="ghost" onClick={() => setOpen(true)}>
        <UserPlus size={15} /> Invite someone
      </Button>
    );
  }

  return (
    <form
      className="w-full rounded-lg border border-ink-800 bg-ink-950 p-4 sm:w-96"
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) {
          setError("That email does not look right.");
          return;
        }
        setSentTo(email);
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium">Invite a teammate</span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Cancel">
          <X size={16} className="text-ink-400 hover:text-ink-100" />
        </button>
      </div>

      <div className="space-y-3">
        <Field label="Email" htmlFor="invite-email" error={error}>
          <Input
            id="invite-email"
            type="email"
            value={email}
            placeholder="name@company.com"
            onChange={(e) => {
              setEmail(e.target.value);
              setError(undefined);
            }}
          />
        </Field>

        <Field label="Role" htmlFor="invite-role">
          <Select id="invite-role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Estimator</option>
            <option>Field lead</option>
          </Select>
        </Field>
      </div>

      <Button type="submit" className="mt-4 w-full">
        Send invite
      </Button>
    </form>
  );
}
