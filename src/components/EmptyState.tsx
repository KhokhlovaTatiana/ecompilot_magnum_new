import { FileQuestion } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center rounded-lg border border-emerald-950/10 bg-white p-8 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-leaf-soft text-emerald-800">
        <FileQuestion aria-hidden="true" size={24} />
      </div>
      <h1 className="mt-4 text-2xl font-semibold text-stone-950">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          className="mt-5 rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
