import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield, FolderOpen, FolderPlus, FileText, Plus, ArrowLeft,
  CheckCircle, AlertCircle, XCircle, MoreHorizontal, Pencil, Trash2, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Folder {
  id: string;
  name: string;
  created_at: string;
}

interface SavedContract {
  id: string;
  title: string;
  verdict: string;
  verdict_explanation: string;
  folder_id: string | null;
  created_at: string;
}

const verdictIcons = {
  safe: { icon: CheckCircle, color: "text-safe", bg: "bg-safe/10" },
  caution: { icon: AlertCircle, color: "text-caution", bg: "bg-caution/10" },
  risky: { icon: XCircle, color: "text-risky", bg: "bg-risky/10" },
};

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [contracts, setContracts] = useState<SavedContract[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    const [foldersRes, contractsRes] = await Promise.all([
      supabase.from("folders").select("*").order("name"),
      supabase.from("saved_contracts").select("id, title, verdict, verdict_explanation, folder_id, created_at").order("created_at", { ascending: false }),
    ]);
    setFolders(foldersRes.data || []);
    setContracts(contractsRes.data || []);
    setLoading(false);
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    const { error } = await supabase.from("folders").insert({ name: newFolderName.trim(), user_id: user!.id });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setNewFolderName("");
    setShowNewFolder(false);
    fetchData();
  };

  const renameFolder = async (id: string) => {
    if (!renameValue.trim()) return;
    await supabase.from("folders").update({ name: renameValue.trim() }).eq("id", id);
    setRenamingFolder(null);
    fetchData();
  };

  const deleteFolder = async (id: string) => {
    await supabase.from("folders").delete().eq("id", id);
    if (selectedFolder === id) setSelectedFolder(null);
    fetchData();
  };

  const deleteContract = async (id: string) => {
    await supabase.from("saved_contracts").delete().eq("id", id);
    fetchData();
  };

  const filteredContracts = selectedFolder
    ? contracts.filter((c) => c.folder_id === selectedFolder)
    : contracts.filter((c) => !c.folder_id);

  const unsavedCount = contracts.filter((c) => !c.folder_id).length;

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
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
                <Plus className="h-4 w-4" />
                New Analysis
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">My Contracts</h2>
          <p className="mt-1 text-sm text-muted-foreground">Organize and review your analyzed contracts</p>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar: Folders */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Folders</span>
              <button onClick={() => setShowNewFolder(true)} className="text-primary hover:text-primary/80 transition-colors">
                <FolderPlus className="h-4 w-4" />
              </button>
            </div>

            {/* All / Unsaved */}
            <button
              onClick={() => setSelectedFolder(null)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFolder === null ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <FileText className="h-4 w-4" />
              Unfiled
              {unsavedCount > 0 && (
                <span className="ml-auto text-[11px] bg-muted rounded-full px-1.5 py-0.5">{unsavedCount}</span>
              )}
            </button>

            {folders.map((folder) => {
              const count = contracts.filter((c) => c.folder_id === folder.id).length;
              const isSelected = selectedFolder === folder.id;

              if (renamingFolder === folder.id) {
                return (
                  <form key={folder.id} onSubmit={(e) => { e.preventDefault(); renameFolder(folder.id); }} className="flex items-center gap-1 px-2">
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => setRenamingFolder(null)}
                      className="flex-1 bg-secondary border border-border rounded-md px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary/40"
                    />
                  </form>
                );
              }

              return (
                <div key={folder.id} className="group flex items-center">
                  <button
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isSelected ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span className="truncate">{folder.name}</span>
                    {count > 0 && (
                      <span className="ml-auto text-[11px] bg-muted rounded-full px-1.5 py-0.5">{count}</span>
                    )}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setRenamingFolder(folder.id); setRenameValue(folder.name); }}>
                        <Pencil className="h-3.5 w-3.5 mr-2" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteFolder(folder.id)} className="text-destructive">
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}

            {showNewFolder && (
              <form onSubmit={(e) => { e.preventDefault(); createFolder(); }} className="flex items-center gap-1 px-2">
                <input
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onBlur={() => { if (!newFolderName.trim()) setShowNewFolder(false); }}
                  placeholder="Folder name"
                  className="flex-1 bg-secondary border border-border rounded-md px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                />
              </form>
            )}
          </div>

          {/* Main: Contract list */}
          <div>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : filteredContracts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center border border-border">
                  <FileText className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="mt-5 font-display text-base font-semibold text-foreground/70">
                  {selectedFolder ? "No contracts in this folder" : "No unfiled contracts"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Analyze a contract and save it here
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredContracts.map((c) => {
                  const v = verdictIcons[c.verdict as keyof typeof verdictIcons] || verdictIcons.caution;
                  const Icon = v.icon;
                  return (
                    <Card
                      key={c.id}
                      className="glass-surface cursor-pointer hover:border-primary/20 transition-all group"
                      onClick={() => navigate(`/contract/${c.id}`)}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${v.bg}`}>
                          <Icon className={`h-5 w-5 ${v.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {c.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {c.verdict_explanation}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground/50">
                            {new Date(c.created_at).toLocaleDateString()}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {folders.map((f) => (
                                <DropdownMenuItem
                                  key={f.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    supabase.from("saved_contracts").update({ folder_id: f.id }).eq("id", c.id).then(() => fetchData());
                                  }}
                                >
                                  <FolderOpen className="h-3.5 w-3.5 mr-2" /> Move to {f.name}
                                </DropdownMenuItem>
                              ))}
                              {c.folder_id && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    supabase.from("saved_contracts").update({ folder_id: null }).eq("id", c.id).then(() => fetchData());
                                  }}
                                >
                                  <FileText className="h-3.5 w-3.5 mr-2" /> Remove from folder
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); deleteContract(c.id); }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
