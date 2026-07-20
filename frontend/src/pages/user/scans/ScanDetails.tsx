import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Calendar, Globe, AlertTriangle } from "lucide-react";
import { scanAPI } from "@/api/scanApi";

interface ScanResult {
  name: string;
  severity: string;
  description: string;
  details?: string;
  recommendation?: string;
}

interface Scan {
  url: string;
  timestamp: string;
  risk_score: number;
  severity_summary: Record<string, number>;
  results: ScanResult[];
}

export default function ScanDetails() {
  const { id } = useParams();
  const [scan, setScan] = useState<Scan | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  useEffect(() => {
    const fetchScan = async () => {
      try {
        if (!id) return;
        const data = await scanAPI.getScan(id);
        setScan(data);
      } catch (err) {
        console.error("Failed to load scan:", err);
      }
    };

    fetchScan();
  }, [id]);

  if (!scan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading scan report...</p>
      </div>
    );
  }

  const grouped = scan.results.reduce(
    (acc: Record<string, ScanResult[]>, item) => {
      if (!acc[item.severity]) acc[item.severity] = [];
      acc[item.severity].push(item);
      return acc;
    },
    {},
  );

  const severityConfig: Record<
    string,
    { color: string; bgColor: string; icon: string }
  > = {
    critical: {
      color: "text-red-600",
      bgColor: "bg-red-500/10 border-red-500/30",
      icon: "🔴",
    },
    high: {
      color: "text-orange-600",
      bgColor: "bg-orange-500/10 border-orange-500/30",
      icon: "🟠",
    },
    medium: {
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/10 border-yellow-500/30",
      icon: "🟡",
    },
    low: {
      color: "text-blue-600",
      bgColor: "bg-blue-500/10 border-blue-500/30",
      icon: "🔵",
    },
    info: {
      color: "text-green-600",
      bgColor: "bg-green-500/10 border-green-500/30",
      icon: "🟢",
    },
  };

  const downloadPDF = async () => {
    try {
      if (!id) return;
      setLoadingPdf(true);
      const response = await fetch(`http://127.0.0.1:5000/api/scans/${id}/pdf`);

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scan-report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF download error:", error);
    } finally {
      setLoadingPdf(false);
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return "text-red-600";
    if (score >= 6) return "text-orange-600";
    if (score >= 4) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-3 flex-1">
          <h1 className="text-4xl font-bold text-foreground">
            Vulnerability Report
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {scan.url}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(scan.timestamp).toLocaleDateString()} at{" "}
              {new Date(scan.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>

        <Button
          onClick={downloadPDF}
          disabled={loadingPdf}
          className="gap-2 whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          {loadingPdf ? "Generating..." : "Download PDF"}
        </Button>
      </div>

      <div>
        {/* RISK SCORE - PROMINENT */}
        <Card className="lg:col-span-2 border-border/50 shadow-lg bg-secondary/30">
          <CardContent className="p-6">
            <p className="text-muted-foreground text-sm font-medium mb-2">
              Overall Risk
            </p>
            <div
              className={`text-5xl font-bold ${getRiskScoreColor(scan.risk_score)}`}
            >
              {scan.risk_score}
              <span className="text-xl text-muted-foreground">/10</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {scan.risk_score >= 8 && "Critical Risk"}
              {scan.risk_score >= 6 && scan.risk_score < 8 && "High Risk"}
              {scan.risk_score >= 4 && scan.risk_score < 6 && "Medium Risk"}
              {scan.risk_score < 4 && "Low Risk"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* RISK SCORE & STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* SEVERITY STATS */}
        {["critical", "high", "medium", "low", "info"].map((level) => (
          <Card
            key={level}
            className={`border-border/50 ${severityConfig[level]?.bgColor}`}
          >
            <CardContent className="p-4 text-center">
              <p className="text-2xl mb-2">{severityConfig[level]?.icon}</p>
              <p
                className={`text-2xl font-bold ${severityConfig[level]?.color}`}
              >
                {scan.severity_summary?.[level] || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                {level}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FINDINGS BY SEVERITY */}
      <div className="space-y-4">
        {["critical", "high", "medium", "low", "info"].map((level) =>
          grouped[level] ? (
            <Card
              key={level}
              className={`border border-border/50 overflow-hidden ${
                severityConfig[level]?.bgColor
              }`}
            >
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {severityConfig[level]?.icon}
                  </span>
                  <div>
                    <CardTitle className="capitalize text-lg">
                      {level} Severity Issues
                    </CardTitle>
                  </div>
                </div>
                <Badge
                  className={`${severityConfig[level]?.color} ${severityConfig[level]?.bgColor} border`}
                >
                  {grouped[level].length}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                {grouped[level].map((item, i) => (
                  <div
                    key={i}
                    className="p-4 border border-border/50 rounded-lg hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                        {item.details && (
                          <p className="text-xs text-muted-foreground mt-2 p-2 bg-secondary/30 rounded border border-border/30">
                            {item.details}
                          </p>
                        )}
                        {item.recommendation && (
                          <div className="mt-2 p-2 bg-accent/10 rounded border border-accent/30">
                            <p className="text-xs font-medium text-accent">
                              💡 Recommendation: {item.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null,
        )}
      </div>

      {/* NO FINDINGS */}
      {Object.keys(grouped).length === 0 && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-8 text-center">
            <p className="text-green-600 font-medium">
              ✓ No vulnerabilities found!
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              This scan completed successfully with no issues detected.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
