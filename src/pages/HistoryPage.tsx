import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, FileText, CheckCircle, AlertCircle, XCircle, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisResults, type AnalysisData } from "@/components/AnalysisResults";
import { ContractChat } from "@/components/ContractChat";

interface SavedAnalysis {
  id: string;
  document_title: string | null;
  document_text: string;
  verdict: string;
  verdict_explanation: string;
  summary: any;
  risks: any;
  before_you_accept: any;
  hidden_clauses: any;
  created_at: string;
}

const verdictIcons = {
  safe: { icon: CheckCircle, color: "text-safe", bg: "bg-safe/10" },
  caution: { icon: AlertCircle, color: "text-caution", bg: "bg-caution/10" },
  risky: { icon: XCircle, color: "text-risky", bg: "bg-risky/10" },
};

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SavedAnalysis | null>(null);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    const { data } = await supabase
      .from("contract_analyses")
      .select("id, document_title, document_text, verdict, verdict_explanation, summary, risks, before_you_accept, hidden_clauses, created_at")
      .order("created_at", { ascending: false });
    setAnalyses(data || []);
    setLoading(false);
  };

  const toAnalysisData = (a: SavedAnalysis): AnalysisData => ({
    summary: a.summary as string[],
    risks: a.risks as any[],
    beforeYouAccept: (a.before_you_accept || []) as string[],
    hiddenClauses: (a.hidden_clauses || []) as string[],
    verdict: a.verdict as "safe" | "caution" | "risky",
    verdictExplanation: a.verdict_explanation,
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px]" />

      {/* Header */}
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Shield className="h-[18px] w-[18px] text-primary" />
            </div>
            <h1 className="text-xl font-display font-bold tracking-tight text-foreground">
              Fine<span className="text-gradient">Print</span>
            </h1>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              New Analysis
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 relative">
        {selected ? (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to history
            </button>
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">
              {selected.document_title || "Untitled Document"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Analyzed on {new Date(selected.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>

            <div className="grid gap-8 lg:grid-cols-2 items-start">
              {/* Original Document */}
              <div className="rounded-xl bg-card border border-border p-1 flex flex-col min-h-[400px]">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60">
                  <ClipboardPaste className="h-3.5 w-3.5 text-primary/70" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Original Document</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap max-h-[600px]">
                  {selected.document_text}
                </div>
              </div>

              {/* Analysis Results */}
              <div>
                <AnalysisResults data={toAnalysisData(selected)} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
                Analysis History
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Review your past contract analyses
              </p>
            </div>

            {loading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : analyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted/30 flex items-center justify-center border border-border/30">
                  <FileText className="h-7 w-7 text-muted-foreground/30" />
                </div>
                <p className="mt-5 font-display text-base font-semibold text-muted-foreground/60">No analyses yet</p>
                <p className="mt-1 text-sm text-muted-foreground/40">
                  Go back and analyze a document to see it here
                </p>
              </div>
            ) : (
              <div className="grid gap-3 max-w-2xl">
                {analyses.map((a) => {
                  const v = verdictIcons[a.verdict as keyof typeof verdictIcons] || verdictIcons.caution;
                  const Icon = v.icon;
                  return (
                    <Card
                      key={a.id}
                      className="glass-surface cursor-pointer hover:border-border/60 transition-all group"
                      onClick={() => setSelected(a)}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${v.bg}`}>
                          <Icon className={`h-5 w-5 ${v.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {a.document_title || "Untitled Document"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {a.verdict_explanation}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground/50 shrink-0">
                          {new Date(a.created_at).toLocaleDateString()}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {selected && (
        <ContractChat
          documentText={selected.document_text}
          analysisData={toAnalysisData(selected)}
        />
      )}
    </div>
  );
}
