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

  // 🔥 Backend module → UI step mapping
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
    { bg: string; text: string; badge: string; icon: React.ReactNode }
  > = {
    critical: {
      bg: "bg-red-950/40",
      text: "text-red-400",
      badge: "bg-red-950 text-red-200",
      icon: <AlertCircle className="w-4 h-4 text-red-500" />,
    },
    high: {
      bg: "bg-orange-950/40",
      text: "text-orange-400",
      badge: "bg-orange-950 text-orange-200",
      icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
    },
    medium: {
      bg: "bg-yellow-950/40",
      text: "text-yellow-400",
      badge: "bg-yellow-950 text-yellow-200",
      icon: <AlertCircle className="w-4 h-4 text-yellow-500" />,
    },
    low: {
      bg: "bg-blue-950/40",
      text: "text-blue-400",
      badge: "bg-blue-950 text-blue-200",
      icon: <CheckCircle2 className="w-4 h-4 text-blue-400" />,
    },
    info: {
      bg: "bg-slate-900/40",
      text: "text-slate-400",
      badge: "bg-slate-900 text-slate-200",
      icon: <ShieldCheck className="w-4 h-4 text-slate-400" />,
    },
  };

  const { startScan } = useScanStream();
  const handleScan = () => {
    if (!url) return alert("Enter URL");

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

  // Group results
  const groupedResults = useMemo(() => {
    return results.reduce<Record<string, ScanResult[]>>((acc, item) => {
      const severity = item.severity ?? "info";
      if (!acc[severity]) acc[severity] = [];
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
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
          New Scan
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-0">
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            Website Vulnerability Scan
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-5 p-6">
            {/* INPUT */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Target URL
              </label>
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-muted/50"
              />
            </div>

            {/* PROGRESS SECTION */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-accent">
                      Scan in Progress
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {currentStep !== null
                        ? `${currentStep + 1} of ${scanSteps.length}`
                        : "Starting..."}
                    </span>
                  </div>
                  <div className="w-full bg-muted/30 h-2.5 rounded-full overflow-hidden border border-border/50">
                    <motion.div
                      className="bg-gradient-to-r from-accent to-accent/70 h-full rounded-full"
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
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {scanSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all ${
                        currentStep === index
                          ? "bg-accent/10 border-accent/50"
                          : currentStep !== null && currentStep > index
                            ? "bg-green-950/20 border-green-800/30"
                            : "bg-muted/20 border-border/30"
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
                          <Loader2 className="w-4 h-4 text-accent flex-shrink-0" />
                        </motion.div>
                      ) : currentStep !== null && currentStep > index ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 border border-border/50 rounded-full flex-shrink-0" />
                      )}
                      <span className="text-xs font-medium text-muted-foreground truncate">
                        {step}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* RESULTS SECTION */}
            {completed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">
                      Total Issues
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {totalIssues}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-3 border ${criticalCount > 0 ? "bg-red-950/20 border-red-800/30" : "bg-muted/30 border-border/50"}`}
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      Critical
                    </p>
                    <p
                      className={`text-2xl font-bold ${criticalCount > 0 ? "text-red-400" : "text-muted-foreground"}`}
                    >
                      {criticalCount}
                    </p>
                  </div>
                  <div className="bg-green-950/20 rounded-lg p-3 border border-green-800/30">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="text-sm font-bold text-green-400">Complete</p>
                  </div>
                </div>

                {/* Issues by Severity */}
                <div className="space-y-3">
                  {severityOrder.map(
                    (level) =>
                      groupedResults?.[level] && (
                        <motion.div
                          key={level}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`rounded-lg border overflow-hidden ${severityConfig[level].bg} border-border/50`}
                        >
                          {/* Header */}
                          <div
                            className={`px-4 py-3 border-b border-border/30 flex items-center justify-between bg-black/20`}
                          >
                            <div className="flex items-center gap-2">
                              {severityConfig[level].icon}
                              <span className="font-semibold capitalize text-sm">
                                {level} Issues
                              </span>
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded text-xs font-medium ${severityConfig[level].badge}`}
                            >
                              {groupedResults[level].length}
                            </span>
                          </div>

                          {/* Issues List */}
                          <div className="space-y-2 p-4">
                            {groupedResults[level].map(
                              (item: ScanResult, idx: number) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="bg-black/30 rounded border border-border/40 p-3 space-y-2"
                                >
                                  <p
                                    className={`font-medium text-sm ${severityConfig[level].text}`}
                                  >
                                    {item.name}
                                  </p>

                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {item.description}
                                  </p>

                                  {item.details && (
                                    <p className="text-xs text-muted-foreground bg-black/50 rounded px-2 py-1 font-mono">
                                      {item.details}
                                    </p>
                                  )}

                                  {item.recommendation && (
                                    <div className="text-xs bg-green-950/30 border border-green-800/30 rounded px-2 py-1 text-green-300">
                                      <span className="font-semibold">
                                        Fix:{" "}
                                      </span>
                                      {item.recommendation}
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

                {/* Completion Message */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-3 px-4 bg-green-950/20 border border-green-800/30 rounded-lg"
                >
                  <p className="text-green-400 font-semibold text-sm">
                    ✓ Scan Completed Successfully
                  </p>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-border/50 pt-4 pb-4 px-6">
          <Button
            onClick={handleScan}
            disabled={loading}
            className="w-full gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scanning Website...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Start Scan</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
