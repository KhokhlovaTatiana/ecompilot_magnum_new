import type { Metric } from "../types";

type MetricCardProps = {
  metric: Metric;
};

export function MetricCard({ metric }: MetricCardProps) {
  const valueClassName =
    metric.value.length > 14
      ? "text-xl leading-snug sm:text-2xl"
      : "text-3xl";

  return (
    <div className="rounded-lg border border-emerald-950/10 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-emerald-800">{metric.label}</div>
      <div className={`mt-2 font-semibold text-stone-950 ${valueClassName}`}>
        {metric.value}
      </div>
      <p className="mt-2 text-sm leading-6 text-stone-600">{metric.description}</p>
    </div>
  );
}
