import { Benefits } from "@/components/landing/benefits";
import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Header />
      <Hero />
      <Features />
      <Benefits />
      <CTA />
      <Footer />
    </div>
  );
}
