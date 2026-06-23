import { Sprout } from "lucide-react";

type InsightListProps = {
  title: string;
  insights: string[];
};

export function InsightList({ title, insights }: InsightListProps) {
  if (!insights.length) {
    return (
      <div className="min-w-0 rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-950">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Инсайты появятся после подключения данных.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-stone-950">{title}</h2>
      <ul className="mt-4 space-y-3">
        {insights.map((insight) => (
          <li key={insight} className="flex gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-leaf-soft text-emerald-800">
              <Sprout aria-hidden="true" size={16} />
            </span>
            <span className="text-sm leading-6 text-stone-700">{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
