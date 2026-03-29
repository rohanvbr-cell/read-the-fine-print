import { useState } from "react";
import { Shield, Sparkles, Upload, ArrowRight, History, ClipboardPaste, Scan, Save, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AnalysisResults, type AnalysisData } from "@/components/AnalysisResults";
import { LoadingState } from "@/components/LoadingState";
import { ContractChat } from "@/components/ContractChat";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisData | null>(null);
  const [savedContractId, setSavedContractId] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({ title: "Nothing to analyze", description: "Please paste some text first.", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setResults(null);
    setSavedContractId(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-contract", {
        body: { text },
      });
      if (error) throw error;

      const analysisData = data as AnalysisData;
      setResults(analysisData);

      // Auto-save to old table for anonymous history
      const titleGuess = text.slice(0, 80).split("\n")[0].trim() || "Untitled Document";
      setSaveTitle(titleGuess);

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

  const handleSave = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!results || !saveTitle.trim()) return;

    setSaving(true);
    try {
      const { data, error } = await supabase.from("saved_contracts").insert({
        user_id: user.id,
        title: saveTitle.trim(),
        document_text: text.slice(0, 50000),
        verdict: results.verdict,
        verdict_explanation: results.verdictExplanation,
        summary: results.summary as any,
        risks: results.risks as any,
        before_you_accept: (results.beforeYouAccept || []) as any,
        hidden_clauses: (results.hiddenClauses || []) as any,
      }).select("id").single();

      if (error) throw error;

      setSavedContractId(data.id);
      setShowSaveDialog(false);
      toast({ title: "Saved!", description: "Contract saved to your dashboard." });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
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
      <div className="pointer-events-none absolute -top-40 left-1/3 w-[600px] h-[600px] bg-primary/[0.07] rounded-full blur-[150px]" />
      <div className="pointer-events-none absolute top-1/2 right-0 w-[400px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />

      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/25">
              <Shield className="h-[18px] w-[18px] text-primary" />
            </div>
            <h1 className="text-xl font-display font-bold tracking-tight text-foreground">
              Fine<span className="text-gradient">Print</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="gap-2 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/60">
                    <History className="h-4 w-4" />
                    My Contracts
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/history">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                    <History className="h-4 w-4" />
                    History
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 relative">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground leading-tight">
            Understand what you're agreeing to
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-lg">
            Paste any terms of service, contract, or agreement. We'll highlight risks, hidden clauses, and give you a clear verdict.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-stretch">
          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-card border border-border p-1 glow-border flex-1 flex flex-col min-h-[420px]">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60">
                <ClipboardPaste className="h-3.5 w-3.5 text-primary/70" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Document Input</span>
                {text && (
                  <span className="ml-auto text-[11px] text-muted-foreground/60 font-mono">
                    {text.length.toLocaleString()} chars
                  </span>
                )}
              </div>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your terms & conditions, contract, or agreement here..."
                className="flex-1 resize-none border-0 bg-transparent font-body text-sm leading-relaxed placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-b-lg"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button variant="hero" size="lg" onClick={handleAnalyze} disabled={isAnalyzing || !text.trim()} className="px-6">
                <Sparkles className="h-4 w-4" />
                Analyze
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>

              <label className="cursor-pointer group">
                <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
                <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground group-hover:text-foreground group-hover:border-primary/30 transition-all">
                  <Upload className="h-4 w-4" />
                  Upload .txt
                </div>
              </label>
            </div>
          </div>

          <div className="flex flex-col">
            {isAnalyzing && (
              <div className="rounded-xl border border-dashed border-border bg-card/50 flex-1 flex items-center justify-center min-h-[420px]">
                <LoadingState />
              </div>
            )}
            {results && !isAnalyzing && (
              <div className="space-y-4">
                {/* Save button */}
                {!savedContractId && (
                  <div>
                    {showSaveDialog ? (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border">
                        <input
                          autoFocus
                          value={saveTitle}
                          onChange={(e) => setSaveTitle(e.target.value)}
                          placeholder="Contract title..."
                          className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                        />
                        <Button size="sm" onClick={handleSave} disabled={saving || !saveTitle.trim()}>
                          {saving ? "Saving…" : "Save"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowSaveDialog(false)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!user) { navigate("/auth"); return; }
                          setShowSaveDialog(true);
                        }}
                        className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
                      >
                        <Save className="h-4 w-4" />
                        {user ? "Save to My Contracts" : "Sign in to Save"}
                      </Button>
                    )}
                  </div>
                )}
                {savedContractId && (
                  <div className="flex items-center gap-2 text-sm text-safe">
                    <Save className="h-4 w-4" />
                    Saved! <Link to={`/contract/${savedContractId}`} className="underline hover:text-primary">View in dashboard →</Link>
                  </div>
                )}
                <AnalysisResults data={results} />
              </div>
            )}
            {!results && !isAnalyzing && (
              <div className="rounded-xl border border-dashed border-border bg-card/50 flex flex-col items-center justify-center flex-1 min-h-[420px] text-center px-6">
                <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center border border-border">
                  <Scan className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="mt-5 font-display text-lg font-semibold text-foreground/70">Analysis Results</p>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-[260px]">
                  Paste a contract on the left and click <span className="text-primary font-medium">Analyze</span> to see your breakdown
                </p>
                <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground/60">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-safe" /> Safe</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-caution" /> Caution</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-risky" /> Risky</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {results && text && (
        <ContractChat
          documentText={text}
          analysisData={results}
          contractId={savedContractId || undefined}
        />
      )}
    </div>
  );
}
