"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    title: "Real-time Threat Detection",
    description:
      "Continuously monitor your applications for vulnerabilities and security threats with our advanced detection engine.",
  },
  {
    icon: Zap,
    title: "Instant Alerts",
    description:
      "Receive immediate notifications when vulnerabilities are detected so you can respond quickly.",
  },
  {
    icon: BarChart3,
    title: "Detailed Reports",
    description:
      "Get comprehensive vulnerability reports with severity levels, affected components, and remediation steps.",
  },
  {
    icon: Settings,
    title: "Easy Integration",
    description:
      "Seamlessly integrate with your CI/CD pipeline and existing development workflow in minutes.",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description:
      "Enterprise-grade security standards with data encryption and compliance with OWASP standards.",
  },
  {
    icon: RefreshCw,
    title: "Continuous Monitoring",
    description:
      "Keep your applications secure with ongoing vulnerability assessments and automated scanning.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="py-20 md:py-32 px-4 bg-card border-t border-border"
    >
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Powerful Security Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to identify and eliminate web application
            vulnerabilities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-border hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-foreground">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
