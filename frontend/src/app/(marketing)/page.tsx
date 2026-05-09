import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Workflow } from "@/components/landing/Workflow";
import { Intelligence } from "@/components/landing/Intelligence";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Workflow />
      <Intelligence />
      <Pricing />
      <CTA />
    </>
  );
}
