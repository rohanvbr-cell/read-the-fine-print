import { useState } from "react";
import { Shield, Sparkles, Upload, FileText, ArrowRight, History } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AnalysisResults, type AnalysisData } from "@/components/AnalysisResults";
import { LoadingState } from "@/components/LoadingState";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisData | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({ title: "Nothing to analyze", description: "Please paste some text first.", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-contract", {
        body: { text },
      });
      if (error) throw error;

      const analysisData = data as AnalysisData;
      setResults(analysisData);

      // Save to database
      const titleGuess = text.slice(0, 80).split("\n")[0].trim() || "Untitled Document";
      await supabase.from("contract_analyses").insert({
        document_title: titleGuess,
        document_text: text.slice(0, 50000),
        verdict: analysisData.verdict,
        verdict_explanation: analysisData.verdictExplanation,
        summary: analysisData.summary as any,
        risks: analysisData.risks as any,
        before_you_accept: (analysisData.beforeYouAccept || []) as any,
        hidden_clauses: (analysisData.hiddenClauses || []) as any,
      });
    } catch (err: any) {
      toast({
        title: "Analysis failed",
        description: err?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "text/plain" && !file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
      toast({ title: "Unsupported file", description: "Please upload a .txt or .md file.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setText(ev.target?.result as string);
    reader.readAsText(file);
  };

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
          <Link to="/history">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <History className="h-4 w-4" />
              History
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10 relative">
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          {/* Left: Input */}
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground leading-tight">
                Understand what<br />you're agreeing to
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md">
                Paste any terms of service, contract, or agreement. We'll highlight risks, hidden clauses, and give you a clear verdict.
              </p>
            </div>

            <div className="relative">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your terms & conditions, contract, or agreement here..."
                className="min-h-[380px] resize-none bg-card/40 border-border/30 font-body text-sm leading-relaxed placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all"
              />
              {text && (
                <span className="absolute bottom-3 right-3 text-[11px] text-muted-foreground/50 font-mono">
                  {text.length.toLocaleString()} chars
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="hero"
                size="lg"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !text.trim()}
                className="px-6"
              >
                <Sparkles className="h-4 w-4" />
                Analyze
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>

              <label className="cursor-pointer group">
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="inline-flex items-center gap-2 rounded-xl border border-border/30 bg-card/30 px-4 py-2.5 text-sm font-medium text-muted-foreground group-hover:text-foreground group-hover:border-border/60 transition-all">
                  <Upload className="h-4 w-4" />
                  Upload
                </div>
              </label>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:sticky lg:top-24">
            {isAnalyzing && <LoadingState />}
            {results && !isAnalyzing && <AnalysisResults data={results} />}
            {!results && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted/30 flex items-center justify-center border border-border/30">
                  <FileText className="h-7 w-7 text-muted-foreground/30" />
                </div>
                <p className="mt-5 font-display text-base font-semibold text-muted-foreground/60">
                  Your analysis will appear here
                </p>
                <p className="mt-1 text-sm text-muted-foreground/40">
                  Paste a document and hit Analyze
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
