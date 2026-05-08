import * as React from "react";
import { Typography } from "@/components/ui/Typography";

export type LoadingProps = {
  label?: string;
  className?: string;
};

export function Loading({
  label = "Syncing Data...",
  className = "",
}: LoadingProps) {
  return (
    <div className={["space-y-[var(--spacing-4)]", className].join(" ")} role="status" aria-live="polite">
      <div className="flex items-center gap-[var(--spacing-4)]">
        <div className="relative grid h-12 w-12 place-items-center rounded-full border-4 border-[color:rgba(46,125,50,0.1)]">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
        </div>
        <Typography variant="label" className="text-[var(--color-outline)]">
          {label}
        </Typography>
      </div>
    </div>
  );
}
