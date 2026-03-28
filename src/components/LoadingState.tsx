import { FileSearch } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
      <div className="relative">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <FileSearch className="h-8 w-8 text-primary animate-pulse-subtle" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-primary/5 animate-ping" />
      </div>
      <p className="mt-6 font-display text-lg font-semibold text-foreground">
        Analyzing fine print…
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Scanning for risks, hidden clauses, and red flags
      </p>
      <div className="mt-6 flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-subtle"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>
    </div>
  );
}
