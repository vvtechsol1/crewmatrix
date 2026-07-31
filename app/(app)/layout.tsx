import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getVerifiedSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <AppTopbar />
        <main>{children}</main>
      </div>
    </div>
  );
}
