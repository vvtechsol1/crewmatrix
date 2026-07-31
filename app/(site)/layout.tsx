import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { MotionProvider } from "@/components/motion-provider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MotionProvider />
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
