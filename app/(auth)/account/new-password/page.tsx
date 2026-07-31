import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password — CrewMatrix",
  robots: { index: false, follow: false },
};

export default function NewPasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
      <p className="mt-2 text-sm text-ink-400">
        Use a strong password you have not used for another account.
      </p>
      <ResetPasswordForm />
    </div>
  );
}
