import { useState } from "react";
import { FileText, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AnalysisResults, type AnalysisData } from "@/components/AnalysisResults";
import { LoadingState } from "@/components/LoadingState";
import { useToast } from "@/hooks/use-toast";

const MOCK_RESULT: AnalysisData = {
  summary: [
    "This is a subscription service that auto-renews every year unless you cancel 30 days before renewal.",
    "They collect and share your usage data with third-party advertising partners.",
    "You agree to resolve all disputes through binding arbitration, waiving your right to a jury trial.",
    "The company can change pricing at any time with only 14 days notice via email.",
  ],
  risks: [
    { label: "Auto-Renewal", explanation: "Your subscription renews automatically. You must cancel at least 30 days before the renewal date or you'll be charged for another full year." },
    { label: "Data Sharing", explanation: "Your personal data and usage patterns are shared with third-party advertisers and analytics companies." },
    { label: "Price Changes", explanation: "They can increase the price at any time with just 14 days email notice — easy to miss." },
    { label: "No Refunds", explanation: "All payments are non-refundable, even if you cancel mid-cycle or are unsatisfied with the service." },
  ],
  hiddenClauses: [
    "By using the service, you grant them a perpetual, irrevocable license to use any content you upload — even after you delete your account.",
    "The arbitration clause includes a class action waiver, meaning you can't join a group lawsuit against them.",
    "They reserve the right to suspend your account 'at their sole discretion' without providing a specific reason.",
  ],
  verdict: "caution",
  verdictExplanation: "This agreement has several concerning clauses including aggressive data sharing, auto-renewal traps, and a broad content license. While not uncommon, users should be aware of what they're agreeing to.",
};

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

    // Simulate AI delay — will be replaced with real AI call
    await new Promise((r) => setTimeout(r, 2500));
    setResults(MOCK_RESULT);
    setIsAnalyzing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "text/plain" && !file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
      toast({ title: "Unsupported file", description: "Please upload a .txt or .md file.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setText(ev.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground">
              Fine<span className="text-gradient">Print</span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">
            AI-powered contract analyzer
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Input */}
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Paste your document
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Terms & conditions, contracts, agreements — we'll break it down for you.
              </p>
            </div>

            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your terms & conditions, contract, or agreement here..."
              className="min-h-[400px] resize-none bg-card/60 backdrop-blur-sm border-border/50 font-body text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20"
            />

            <div className="flex items-center gap-3">
              <Button
                variant="hero"
                size="lg"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !text.trim()}
                className="flex-1 sm:flex-none"
              >
                <Sparkles className="h-4 w-4" />
                Analyze Document
              </Button>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-card/60 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors">
                  <Upload className="h-4 w-4" />
                  Upload .txt
                </div>
              </label>
            </div>

            {text && (
              <p className="text-xs text-muted-foreground">
                {text.length.toLocaleString()} characters pasted
              </p>
            )}
          </div>

          {/* Right: Results */}
          <div>
            {isAnalyzing && <LoadingState />}

            {results && !isAnalyzing && <AnalysisResults data={results} />}

            {!results && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/50">
                  <FileText className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="mt-4 font-display text-lg font-semibold text-muted-foreground">
                  Results will appear here
                </p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  Paste a document and click "Analyze" to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
