"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Loader2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useScanStream } from "@/lib/useScan";

type ScanResult = {
  severity?: string;
  name?: string;
  description?: string;
  details?: string;
  recommendation?: string;
  [key: string]: unknown;
};

type ScanCompleteData = {
  results?: ScanResult[];
};

export default function ScanDialog() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  const moduleMap: Record<string, number> = {
    header_analysis: 0,
    ssl_tls: 1,
    port_scan: 2,
    tech_detection: 3,
    dir_enum: 4,
    sqli: 5,
    xss: 6,
    cors: 7,
    cookies: 8,
    info_disclosure: 9,
  };

  const scanSteps = [
    "Header Analysis",
    "SSL/TLS Check",
    "Port Scan",
    "Tech Detection",
    "Directory Discovery",
    "SQL Injection Test",
    "XSS Test",
    "CORS Check",
    "Cookie Security",
    "Info Disclosure",
  ];

  const severityConfig: Record<
    string,
    {
      container: string;
      text: string;
      badge: string;
      icon: React.ReactNode;
    }
  > = {
    critical: {
      container:
        "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20",
      text: "text-red-600 dark:text-red-400",
      badge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
    },

    high: {
      container:
        "border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/20",
      text: "text-orange-600 dark:text-orange-400",
      badge:
        "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
      icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
    },

    medium: {
      container:
        "border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-950/20",
      text: "text-yellow-600 dark:text-yellow-400",
      badge:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
      icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    },

    low: {
      container:
        "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20",
      text: "text-blue-600 dark:text-blue-400",
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
      icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />,
    },

    info: {
      container: "border-border bg-muted/50",
      text: "text-muted-foreground",
      badge: "bg-muted text-muted-foreground",
      icon: <ShieldCheck className="h-4 w-4 text-muted-foreground" />,
    },
  };

  const { startScan } = useScanStream();

  const handleScan = () => {
    if (!url.trim()) {
      alert("Enter URL");
      return;
    }

    setLoading(true);
    setResults([]);
    setCompleted(false);
    setCurrentStep(null);

    startScan(url, {
      onProgress: ({ module, status }: { module: string; status: string }) => {
        const stepIndex = moduleMap[module];

        if (stepIndex !== undefined && status === "running") {
          setCurrentStep(stepIndex);
        }
      },

      onComplete: (finalData: ScanCompleteData) => {
        setResults(finalData.results || []);
        setLoading(false);
        setCompleted(true);
        setCurrentStep(null);
      },

      onError: (err: unknown) => {
        console.error(err);
        setLoading(false);
        setCurrentStep(null);
      },
    });
  };

  const groupedResults = useMemo(() => {
    return results.reduce<Record<string, ScanResult[]>>((acc, item) => {
      const severity = item.severity?.toLowerCase() ?? "info";

      if (!acc[severity]) {
        acc[severity] = [];
      }

      acc[severity].push(item);

      return acc;
    }, {});
  }, [results]);

  const severityOrder = ["critical", "high", "medium", "low", "info"];

  const totalIssues = results.length;
  const criticalCount = groupedResults.critical?.length || 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
          New Scan
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="h-5 w-5 text-accent" />
            Website Vulnerability Scan
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-1 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Target URL
              </label>

              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                disabled={loading}
                className="bg-background"
              />
            </div>

            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Scan in Progress
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Analyzing your website security
                    </p>
                  </div>

                  <span className="rounded-md bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                    {currentStep !== null
                      ? `${currentStep + 1} / ${scanSteps.length}`
                      : "Starting"}
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        currentStep !== null
                          ? ((currentStep + 1) / scanSteps.length) * 100
                          : 5
                      }%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {scanSteps.map((step, index) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                        currentStep === index
                          ? "border-accent/50 bg-accent/10"
                          : currentStep !== null && currentStep > index
                            ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20"
                            : "border-border bg-muted/30"
                      }`}
                    >
                      {currentStep === index ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            ease: "linear",
                          }}
                        >
                          <Loader2 className="h-4 w-4 shrink-0 text-accent" />
                        </motion.div>
                      ) : currentStep !== null && currentStep > index ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                      ) : (
                        <div className="h-4 w-4 shrink-0 rounded-full border-2 border-border" />
                      )}

                      <span className="truncate text-xs font-medium text-muted-foreground">
                        {step}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {completed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground">
                      Total Issues
                    </p>

                    <p className="mt-1 text-2xl font-bold text-foreground">
                      {totalIssues}
                    </p>
                  </div>

                  <div
                    className={`rounded-lg border p-4 ${
                      criticalCount > 0
                        ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
                        : "border-border bg-card"
                    }`}
                  >
                    <p className="text-xs text-muted-foreground">Critical</p>

                    <p
                      className={`mt-1 text-2xl font-bold ${
                        criticalCount > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {criticalCount}
                    </p>
                  </div>

                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/20">
                    <p className="text-xs text-muted-foreground">Status</p>

                    <p className="mt-1 text-sm font-bold text-green-600 dark:text-green-400">
                      Complete
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {severityOrder.map(
                    (level) =>
                      groupedResults[level] && (
                        <motion.div
                          key={level}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`overflow-hidden rounded-lg border ${severityConfig[level].container}`}
                        >
                          <div className="flex items-center justify-between border-b border-border/70 bg-background/40 px-4 py-3">
                            <div className="flex items-center gap-2">
                              {severityConfig[level].icon}

                              <span className="text-sm font-semibold capitalize text-foreground">
                                {level} Issues
                              </span>
                            </div>

                            <span
                              className={`rounded-md px-2.5 py-1 text-xs font-medium ${severityConfig[level].badge}`}
                            >
                              {groupedResults[level].length}
                            </span>
                          </div>

                          <div className="space-y-3 p-4">
                            {groupedResults[level].map(
                              (item: ScanResult, index: number) => (
                                <motion.div
                                  key={index}
                                  initial={{
                                    opacity: 0,
                                    scale: 0.95,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    scale: 1,
                                  }}
                                  className="space-y-3 rounded-lg border border-border bg-card p-4"
                                >
                                  <p
                                    className={`text-sm font-semibold ${severityConfig[level].text}`}
                                  >
                                    {item.name || "Security Issue"}
                                  </p>

                                  {item.description && (
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                      {item.description}
                                    </p>
                                  )}

                                  {item.details && (
                                    <div className="rounded-md border border-border bg-muted p-3">
                                      <p className="break-words font-mono text-xs text-muted-foreground">
                                        {item.details}
                                      </p>
                                    </div>
                                  )}

                                  {item.recommendation && (
                                    <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-900/50 dark:bg-green-950/20">
                                      <p className="text-xs leading-relaxed text-green-700 dark:text-green-300">
                                        <span className="font-semibold">
                                          Recommendation:{" "}
                                        </span>

                                        {item.recommendation}
                                      </p>
                                    </div>
                                  )}
                                </motion.div>
                              ),
                            )}
                          </div>
                        </motion.div>
                      ),
                  )}
                </div>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/50 dark:bg-green-950/20"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />

                  <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                    Scan Completed Successfully
                  </p>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-4">
          <Button
            onClick={handleScan}
            disabled={loading}
            className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning Website...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Start Scan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
