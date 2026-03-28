import { FileSearch } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-300">
      <div className="relative">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/15">
          <FileSearch className="h-7 w-7 text-primary animate-pulse-subtle" />
        </div>
      </div>
      <p className="mt-6 font-display text-base font-semibold text-foreground">
        Analyzing fine print…
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Scanning for risks and hidden clauses
      </p>
      <div className="mt-5 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1 w-1 rounded-full bg-primary animate-pulse-subtle"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>
    </div>
  );
}
