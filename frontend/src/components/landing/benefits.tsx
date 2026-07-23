"use client";

import { Card } from "@/components/ui/card";

const benefits = [
  {
    stat: "99.8%",
    description: "Threat Detection Accuracy",
  },
  {
    stat: "<5min",
    description: "Average Scan Time",
  },
  {
    stat: "1000+",
    description: "Vulnerabilities Covered",
  },
  {
    stat: "24/7",
    description: "Continuous Monitoring",
  },
];

export function Benefits() {
  return (
    <section
      id="benefits"
      className="py-20 md:py-32 px-4 bg-background border-t border-border"
    >
      <div className="container max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16">
          Why Teams Choose VulnScan
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="border-border p-8 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl md:text-5xl font-bold text-accent mb-4">
                {benefit.stat}
              </div>
              <p className="text-muted-foreground">{benefit.description}</p>
            </Card>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 pt-16 border-t border-border">
          <p className="text-center text-muted-foreground mb-8">
            Trusted by security teams at leading companies
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 items-center opacity-75">
            <div className="font-semibold text-foreground">TechCorp</div>
            <div className="font-semibold text-foreground">SecureApp</div>
            <div className="font-semibold text-foreground">WebGuard</div>
            <div className="font-semibold text-foreground">CloudSafe</div>
          </div>
        </div>
      </div>
    </section>
  );
}
