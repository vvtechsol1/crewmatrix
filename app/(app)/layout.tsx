import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
