import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalysisResults, type AnalysisData } from "@/components/AnalysisResults";
import { ContractChat } from "@/components/ContractChat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ContractRow {
  id: string;
  title: string;
  document_text: string;
  verdict: string;
  verdict_explanation: string;
  summary: any;
  risks: any;
  before_you_accept: any;
  hidden_clauses: any;
  created_at: string;
}

export default function ContractDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contract, setContract] = useState<ContractRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  useEffect(() => {
    if (id && user) fetchContract();
  }, [id, user]);

  const fetchContract = async () => {
    const { data } = await supabase
      .from("saved_contracts")
      .select("*")
      .eq("id", id!)
      .single();
    if (!data) {
      navigate("/dashboard");
      return;
    }
    setContract(data as ContractRow);
    setTitleValue(data.title);
    setLoading(false);
  };

  const saveTitle = async () => {
    if (!titleValue.trim() || !contract) return;
    await supabase.from("saved_contracts").update({ title: titleValue.trim() }).eq("id", contract.id);
    setContract({ ...contract, title: titleValue.trim() });
    setEditingTitle(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!contract) return null;

  const analysisData: AnalysisData = {
    summary: contract.summary as string[],
    risks: contract.risks as any[],
    beforeYouAccept: (contract.before_you_accept || []) as string[],
    hiddenClauses: (contract.hidden_clauses || []) as string[],
    verdict: contract.verdict as "safe" | "caution" | "risky",
    verdictExplanation: contract.verdict_explanation,
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/3 w-[600px] h-[600px] bg-primary/[0.07] rounded-full blur-[150px]" />

      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/25">
              <Shield className="h-[18px] w-[18px] text-primary" />
            </div>
            <h1 className="text-xl font-display font-bold tracking-tight text-foreground">
              Fine<span className="text-gradient">Print</span>
            </h1>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-2xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to contracts
        </button>

        <div className="flex items-center gap-2 mb-1">
          {editingTitle ? (
            <form onSubmit={(e) => { e.preventDefault(); saveTitle(); }} className="flex items-center gap-2 flex-1">
              <input
                autoFocus
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={saveTitle}
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-xl font-display font-bold text-foreground focus:outline-none focus:border-primary/40"
              />
              <button type="submit" className="text-primary">
                <Check className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <>
              <h2 className="font-display text-2xl font-bold text-foreground">{contract.title}</h2>
              <button onClick={() => setEditingTitle(true)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Pencil className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Analyzed on {new Date(contract.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <AnalysisResults data={analysisData} />
      </main>

      <ContractChat
        documentText={contract.document_text}
        analysisData={analysisData}
        contractId={contract.id}
      />
    </div>
  );
}
