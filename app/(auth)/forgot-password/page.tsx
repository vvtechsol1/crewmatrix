import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password — CrewMatrix",
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
      <p className="mt-2 text-sm text-ink-400">
        Give us the email on the account and we will send a link that expires in an hour.
      </p>

      <ForgotPasswordForm />

      <p className="mt-8 text-center text-sm text-ink-400">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-hi-500 hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
