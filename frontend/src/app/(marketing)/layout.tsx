import { CyberBackdrop } from "@/components/ui/CyberBackdrop";
import { LandingNav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CyberBackdrop />
      <LandingNav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
