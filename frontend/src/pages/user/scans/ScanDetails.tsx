import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    return <p className="p-8">Loading scan report...</p>;
  }

  const grouped = scan.results.reduce(
    (acc: Record<string, ScanResult[]>, item) => {
      if (!acc[item.severity]) acc[item.severity] = [];
      acc[item.severity].push(item);
      return acc;
    },
    {},
  );

  const severityColors: Record<string, string> = {
    critical: "bg-red-500/20 text-red-700",
    high: "bg-orange-500/20 text-orange-700",
    medium: "bg-yellow-500/20 text-yellow-700",
    low: "bg-green-500/20 text-green-700",
    info: "bg-blue-500/20 text-blue-700",
  };

  // 🚀 PDF DOWNLOAD FUNCTION
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

  return (
    <div className="p-8 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Vulnerability Scan Report</h1>
          <p className="text-muted-foreground">{scan.url}</p>
          <p className="text-sm">{new Date(scan.timestamp).toLocaleString()}</p>
        </div>

        <Button onClick={downloadPDF} disabled={loadingPdf}>
          {loadingPdf ? "Generating PDF..." : "Download PDF"}
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {["critical", "high", "medium", "low", "info"].map((level) => (
          <Card key={level}>
            <CardContent className="p-4 text-center">
              <p className="text-sm capitalize">{level}</p>
              <p className="text-2xl font-bold">
                {scan.severity_summary?.[level] || 0}
              </p>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm">Risk Score</p>
            <p className="text-2xl font-bold">{scan.risk_score}</p>
          </CardContent>
        </Card>
      </div>

      {/* RESULTS */}
      {["critical", "high", "medium", "low", "info"].map((level) =>
        grouped[level] ? (
          <Card key={level}>
            <CardHeader className="flex justify-between">
              <CardTitle className="capitalize">{level}</CardTitle>
              <Badge className={severityColors[level]}>
                {grouped[level].length}
              </Badge>
            </CardHeader>

            <CardContent>
              {grouped[level].map((item, i) => (
                <div key={i} className="p-4 border rounded mb-3">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null,
      )}
    </div>
  );
}
