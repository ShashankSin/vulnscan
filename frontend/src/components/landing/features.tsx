"use client";

import {
  AlertCircle,
  Zap,
  BarChart3,
  Settings,
  Lock,
  RefreshCw,
} from "lucide-react";

const features = [
  {
    icon: AlertCircle,
    title: "THREAT DETECTION",
    description:
      "Real-time vulnerability analysis with advanced detection algorithms",
    number: "01",
  },
  {
    icon: Zap,
    title: "INSTANT ALERTS",
    description: "Immediate threat notifications with severity classification",
    number: "02",
  },
  {
    icon: BarChart3,
    title: "DETAILED REPORTS",
    description:
      "Comprehensive vulnerability assessments with remediation paths",
    number: "03",
  },
  {
    icon: Settings,
    title: "EASY INTEGRATION",
    description: "Seamless CI/CD pipeline integration and workflow automation",
    number: "04",
  },
  {
    icon: Lock,
    title: "ENTERPRISE SECURITY",
    description: "Military-grade encryption and OWASP compliance standards",
    number: "05",
  },
  {
    icon: RefreshCw,
    title: "CONTINUOUS MONITORING",
    description:
      "24/7 security assessment and automated vulnerability tracking",
    number: "06",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="py-20 md:py-32 px-4 bg-card border-t border-accent/30"
    >
      <div className="container max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <div className="font-mono text-xs text-accent mb-4">
            &gt; MODULE_FEATURES.INIT()
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-mono">
            <span className="glow-text">SCANNING</span> CAPABILITIES
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl font-mono">
            $ identify &amp;&amp; eliminate web application vulnerabilities
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="terminal-border p-6 hover:border-accent/60 transition-colors group bg-background/50"
              >
                {/* Feature number */}
                <div className="text-4xl font-mono text-accent/30 font-bold mb-4 group-hover:text-accent/50 transition-colors">
                  {feature.number}
                </div>

                {/* Icon */}
                <div className="mb-4">
                  <Icon className="w-8 h-8 text-accent group-hover:glow-accent transition-all" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-mono font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm font-mono">
                  {feature.description}
                </p>

                {/* Bottom accent line */}
                <div className="h-px bg-accent/20 mt-4 group-hover:bg-accent/50 transition-colors"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
