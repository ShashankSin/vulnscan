import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 md:py-32 px-4 bg-card border-t border-accent/30 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          style={{
            backgroundImage:
              "linear-gradient(45deg, transparent 24%, rgba(0, 255, 65, 0.05) 25%, rgba(0, 255, 65, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, 0.05) 75%, rgba(0, 255, 65, 0.05) 76%, transparent 77%, transparent)",
            backgroundSize: "80px 80px",
          }}
        ></div>
      </div>

      <div className="container max-w-3xl mx-auto relative z-10">
        <div className="terminal-border p-8 md:p-12 bg-background/50">
          {/* Status indicator */}
          <div className="font-mono text-xs text-accent mb-6 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-accent rounded-full animate-pulse"></span>
            READY FOR DEPLOYMENT
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 font-mono text-center">
            <span className="glow-text">EXECUTE</span> SECURITY
            <br />
            <span className="glow-accent">SCAN NOW</span>
          </h2>

          {/* Description */}
          <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto font-mono">
            $ vulnscan --init-trial --auto-scan
            <br />
            Deploy enterprise-grade vulnerability scanning today. No setup
            required.
          </p>

          {/* Input and CTA */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center">
            <div className="flex-1 flex gap-2 max-w-md mx-auto w-full">
              <Input
                type="email"
                placeholder="your@email.com"
                className="bg-background border-accent/30 text-foreground placeholder:text-muted-foreground font-mono text-sm"
              />
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-mono gap-2 whitespace-nowrap">
                <Zap className="w-4 h-4" />
                DEPLOY
              </Button>
            </div>
          </div>

          {/* Footer text */}
          <p className="text-center text-xs text-muted-foreground font-mono">
            // No credit card required • 30-day full access • Cancel anytime
          </p>
        </div>

        {/* Command line effect */}
        <div className="mt-8 font-mono text-xs text-muted-foreground text-center space-y-1">
          <div>&gt; INITIATING TRIAL SETUP...</div>
          <div>&gt; PROVISIONING SCANNING ENGINE...</div>
          <div className="text-accent">&gt; DEPLOYMENT READY ✓</div>
        </div>
      </div>
    </section>
  );
}
