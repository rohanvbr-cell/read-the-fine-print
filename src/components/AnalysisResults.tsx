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
    bgClass: "bg-safe/10 border-safe/20",
  },
  caution: {
    icon: AlertCircle,
    label: "Caution",
    emoji: "⚠️",
    colorClass: "text-caution",
    bgClass: "bg-caution/10 border-caution/20",
  },
  risky: {
    icon: XCircle,
    label: "Risky",
    emoji: "❌",
    colorClass: "text-risky",
    bgClass: "bg-risky/10 border-risky/20",
  },
};

export function AnalysisResults({ data }: { data: AnalysisData }) {
  const verdict = verdictConfig[data.verdict];
  const VerdictIcon = verdict.icon;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary */}
      <Card className="glass-surface">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Plain English Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.summary.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-secondary-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Risks */}
      <Card className="glass-surface">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-caution" />
            Key Risks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {data.risks.map((risk, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 border border-border/50"
              >
                <span className="shrink-0 rounded-md bg-caution/10 px-2 py-0.5 text-xs font-medium text-caution border border-caution/20">
                  {risk.label}
                </span>
                <span className="text-sm text-secondary-foreground">{risk.explanation}</span>
              </div>
            ))}
            {data.risks.length === 0 && (
              <p className="text-sm text-muted-foreground">No significant risks detected.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden Clauses */}
      <Card className="glass-surface">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-risky" />
            What They Don't Want You to Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.hiddenClauses.map((clause, i) => (
              <li key={i} className="flex items-start gap-2 text-secondary-foreground">
                <span className="mt-0.5 text-risky">•</span>
                <span className="text-sm">{clause}</span>
              </li>
            ))}
            {data.hiddenClauses.length === 0 && (
              <p className="text-sm text-muted-foreground">No hidden clauses found.</p>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Verdict */}
      <Card className={`border-2 ${verdict.bgClass}`}>
        <CardContent className="flex items-center gap-4 p-6">
          <VerdictIcon className={`h-10 w-10 shrink-0 ${verdict.colorClass}`} />
          <div>
            <div className={`text-2xl font-display font-bold ${verdict.colorClass}`}>
              {verdict.emoji} {verdict.label}
            </div>
            <p className="mt-1 text-sm text-secondary-foreground">{data.verdictExplanation}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
