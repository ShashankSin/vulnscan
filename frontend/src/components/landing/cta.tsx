import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

export function CTA() {
  return (
    <section className="py-20 md:py-32 px-4 bg-foreground relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
      </div>

      <div className="container max-w-3xl mx-auto relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-6">
          Ready to Secure Your Applications?
        </h2>

        <p className="text-lg text-background/90 mb-8">
          Join thousands of security teams protecting their web applications.
          Start your free 30-day trial today.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8 justify-center">
          <div className="flex-1 flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="your@email.com"
              className="bg-background/20 text-background placeholder:text-background/60"
            />
            <Button className="bg-accent hover:bg-accent text-accent-foreground gap-2 whitespace-nowrap">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-background/70">
          No credit card required. Full access to all features for 30 days.
        </p>
      </div>
    </section>
  );
}
