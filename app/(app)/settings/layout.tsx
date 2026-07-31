import { SettingsTabs } from "@/components/settings-tabs";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1.5 text-sm text-ink-400">
        Company profile, billing, payouts and who else can act on your account.
      </p>
      <SettingsTabs />
      <div className="mt-8">{children}</div>
    </div>
  );
}
