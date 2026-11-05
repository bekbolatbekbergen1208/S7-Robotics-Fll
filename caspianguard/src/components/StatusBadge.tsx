import { statusLabels } from "@/content/content";
import type { PartStatus } from "@/content/parts";

const icons: Record<PartStatus, React.ReactNode> = {
  prototype: <path d="M4 8.5l2.5 2.5L12 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  concept: <circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.2 2" />,
  next: <path d="M3.5 8h8M8.5 4.5L12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
};

export function StatusBadge({ status, compact = false }: { status: PartStatus; compact?: boolean }) {
  return (
    <span className={`status-badge status-${status}${compact ? " status-compact" : ""}`}>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        {icons[status]}
      </svg>
      <span className={compact ? "sr-only" : undefined}>{statusLabels[status]}</span>
    </span>
  );
}
