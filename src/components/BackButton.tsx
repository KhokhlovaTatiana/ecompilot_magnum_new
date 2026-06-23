import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
  onClick: () => void;
};

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-950/10 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 shadow-sm transition hover:border-emerald-700/40 hover:bg-leaf-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 focus-visible:ring-offset-linen"
      onClick={onClick}
    >
      <ArrowLeft aria-hidden="true" size={18} />
      Назад к сервисам
    </button>
  );
}
