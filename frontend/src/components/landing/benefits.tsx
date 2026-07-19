"use client";

const benefits = [
  {
    stat: "99.8%",
    description: "Detection Accuracy",
    status: "VERIFIED",
  },
  {
    stat: "< 5min",
    description: "Scan Duration",
    status: "OPTIMIZED",
  },
  {
    stat: "1000+",
    description: "Vulnerabilities Covered",
    status: "ACTIVE",
  },
  {
    stat: "24/7",
    description: "Monitoring Active",
    status: "ONLINE",
  },
];

export function Benefits() {
  return (
    <section
      id="benefits"
      className="py-20 md:py-32 px-4 bg-background border-t border-accent/30"
    >
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="font-mono text-xs text-accent mb-4">
            &gt; SYSTEM_STATS.FETCH()
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-4 font-mono">
            WHY <span className="glow-text">VULNSCAN</span>
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto font-mono">
            Enterprise-grade security with proven reliability
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="terminal-border p-8 text-center hover:border-accent/60 transition-colors bg-background/50 group"
            >
              <div className="text-5xl md:text-6xl font-bold text-accent mb-4 font-mono glow-accent">
                {benefit.stat}
              </div>
              <p className="text-muted-foreground mb-4 font-mono text-sm">
                {benefit.description}
              </p>
              <div className="inline-block font-mono text-xs px-3 py-1 border border-accent/40 text-accent group-hover:border-accent group-hover:bg-accent/10 transition-colors">
                $ {benefit.status}
              </div>
            </div>
          ))}
        </div>

        {/* Trust section */}
        <div className="terminal-border p-8 bg-background/50">
          <p className="text-center text-muted-foreground mb-8 font-mono text-sm">
            &gt; TRUSTED BY ENTERPRISE SECURITY TEAMS
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 items-center opacity-60 font-mono">
            <div className="text-foreground font-bold">TechCorp Inc.</div>
            <span className="text-accent/30">//</span>
            <div className="text-foreground font-bold">SecureApp Ltd.</div>
            <span className="text-accent/30">//</span>
            <div className="text-foreground font-bold">WebGuard Pro</div>
            <span className="text-accent/30">//</span>
            <div className="text-foreground font-bold">CloudSafe</div>
          </div>
        </div>

        {/* System status */}
        <div className="mt-8 font-mono text-xs text-muted-foreground text-center space-y-1">
          <div>&gt; SYSTEM STATUS: OPERATIONAL</div>
          <div>&gt; UPTIME: 99.99%</div>
          <div>&gt; LAST_SCAN: 2 minutes ago</div>
        </div>
      </div>
    </section>
  );
}
