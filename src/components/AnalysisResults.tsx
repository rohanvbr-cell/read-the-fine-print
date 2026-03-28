import { Shield, AlertTriangle, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface AnalysisData {
  summary: string[];
  risks: { label: string; explanation: string }[];
  hiddenClauses: string[];
  verdict: "safe" | "caution" | "risky";
  verdictExplanation: string;
}

const verdictConfig = {
  safe: {
    icon: CheckCircle,
    label: "Safe",
    emoji: "✅",
    colorClass: "text-safe",
    bgClass: "bg-safe/5 border-safe/20",
    pillClass: "bg-safe/10 text-safe",
  },
  caution: {
    icon: AlertCircle,
    label: "Caution",
    emoji: "⚠️",
    colorClass: "text-caution",
    bgClass: "bg-caution/5 border-caution/20",
    pillClass: "bg-caution/10 text-caution",
  },
  risky: {
    icon: XCircle,
    label: "Risky",
    emoji: "❌",
    colorClass: "text-risky",
    bgClass: "bg-risky/5 border-risky/20",
    pillClass: "bg-risky/10 text-risky",
  },
};

export function AnalysisResults({ data }: { data: AnalysisData }) {
  const verdict = verdictConfig[data.verdict];
  const VerdictIcon = verdict.icon;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Verdict — top */}
      <Card className={`border ${verdict.bgClass} overflow-hidden`}>
        <CardContent className="flex items-center gap-4 p-5">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${verdict.pillClass}`}>
            <VerdictIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className={`text-xl font-display font-bold ${verdict.colorClass}`}>
              {verdict.emoji} {verdict.label}
            </div>
            <p className="mt-0.5 text-sm text-secondary-foreground leading-relaxed">{data.verdictExplanation}</p>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="glass-surface">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <ul className="space-y-2.5">
            {data.summary.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80 leading-relaxed">
                <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Risks */}
      {data.risks.length > 0 && (
        <Card className="glass-surface">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-caution" />
              Key Risks
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="grid gap-2.5">
              {data.risks.map((risk, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg bg-background/40 p-3"
                >
                  <span className="shrink-0 rounded-md bg-caution/10 px-2 py-0.5 text-[11px] font-semibold text-caution uppercase tracking-wide">
                    {risk.label}
                  </span>
                  <span className="text-sm text-foreground/70 leading-relaxed">{risk.explanation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden Clauses */}
      {data.hiddenClauses.length > 0 && (
        <Card className="glass-surface">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <Eye className="h-4 w-4 text-risky" />
              What They Don't Want You to Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <ul className="space-y-2.5">
              {data.hiddenClauses.map((clause, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/70 leading-relaxed">
                  <span className="mt-1.5 text-risky text-xs">▸</span>
                  <span>{clause}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
