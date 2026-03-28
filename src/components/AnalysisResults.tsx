import { Shield, AlertTriangle, Eye, CheckCircle, XCircle, AlertCircle, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface AnalysisData {
  summary: string[];
  risks: { label: string; severity?: "high" | "medium" | "low"; explanation: string }[];
  hiddenClauses?: string[];
  beforeYouAccept?: string[];
  verdict: "safe" | "caution" | "risky";
  verdictExplanation: string;
}

const verdictConfig = {
  safe: {
    icon: CheckCircle,
    label: "Safe to Sign",
    emoji: "🟢",
    colorClass: "text-safe",
    bgClass: "bg-safe/5 border-safe/20",
    pillClass: "bg-safe/10 text-safe",
  },
  caution: {
    icon: AlertCircle,
    label: "Proceed with Caution",
    emoji: "⚠️",
    colorClass: "text-caution",
    bgClass: "bg-caution/5 border-caution/20",
    pillClass: "bg-caution/10 text-caution",
  },
  risky: {
    icon: XCircle,
    label: "Risky Agreement",
    emoji: "🔴",
    colorClass: "text-risky",
    bgClass: "bg-risky/5 border-risky/20",
    pillClass: "bg-risky/10 text-risky",
  },
};

const severityConfig = {
  high: { label: "High", dotClass: "bg-risky", badgeClass: "bg-risky/10 text-risky border-risky/20" },
  medium: { label: "Medium", dotClass: "bg-caution", badgeClass: "bg-caution/10 text-caution border-caution/20" },
  low: { label: "Low", dotClass: "bg-safe", badgeClass: "bg-safe/10 text-safe border-safe/20" },
};

export function AnalysisResults({ data }: { data: AnalysisData }) {
  const verdict = verdictConfig[data.verdict];
  const VerdictIcon = verdict.icon;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Verdict — top */}
      <Card className={`border-2 ${verdict.bgClass} overflow-hidden`}>
        <CardContent className="flex items-start gap-4 p-5">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${verdict.pillClass}`}>
            <VerdictIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className={`text-xl font-display font-bold ${verdict.colorClass}`}>
              {verdict.emoji} {verdict.label}
            </div>
            <p className="mt-1 text-sm text-foreground/70 leading-relaxed">{data.verdictExplanation}</p>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="glass-surface">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            What This Means for You
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

      {/* Risks with severity */}
      {data.risks.length > 0 && (
        <Card className="glass-surface">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-caution" />
              Risk Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="grid gap-3">
              {data.risks.map((risk, i) => {
                const sev = severityConfig[risk.severity || "medium"];
                return (
                  <div
                    key={i}
                    className="rounded-lg bg-background/40 p-3.5 border border-border/20"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${sev.badgeClass}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sev.dotClass}`} />
                        {sev.label}
                      </span>
                      <span className="text-sm font-semibold text-foreground/90">{risk.label}</span>
                    </div>
                    <p className="text-sm text-foreground/60 leading-relaxed pl-0.5">{risk.explanation}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Before You Accept */}
      {data.beforeYouAccept && data.beforeYouAccept.length > 0 && (
        <Card className="glass-surface border-primary/10">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <Lightbulb className="h-4 w-4 text-primary" />
              Before You Accept This
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <ul className="space-y-2.5">
              {data.beforeYouAccept.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80 leading-relaxed">
                  <span className="mt-0.5 text-primary font-bold text-xs">{i + 1}.</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Legacy support for hiddenClauses if present */}
      {data.hiddenClauses && data.hiddenClauses.length > 0 && (
        <Card className="glass-surface">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <Eye className="h-4 w-4 text-risky" />
              Hidden Clauses
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
