import {
  ArrowDownRight,
  ArrowUpRight,
  Info,
  Minus,
  PackageSearch
} from "lucide-react";
import { useMemo, useState } from "react";
import { BackButton } from "./BackButton";
import { MetricCard } from "./MetricCard";
import type { Metric, ServiceSummary, SkuBudgetData, SkuBudgetItem, SkuBudgetPoint } from "../types";

type SkuBudgetPageProps = {
  service: ServiceSummary;
  data: SkuBudgetData;
  onNavigate: (path: string) => void;
};

type ChartMetric = "rub" | "units";

const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
  style: "currency",
  currency: "RUB"
});

const numberFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0
});

const percentFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 1
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value).replace(",00", "");
}

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatPercent(value: number) {
  return `${percentFormatter.format(value)}%`;
}

function formatDelta(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatCurrency(value)}`;
}

const chartColors = [
  "#2A1409",
  "#4D2417",
  "#7B3F25",
  "#A85D2D",
  "#C78655",
  "#DAB58F",
  "#954F72",
  "#7A3558",
  "#B8734B",
  "#E4C6AA",
  "#5A2A1A",
  "#F0DFD0"
];

function actionTone(action: SkuBudgetItem["action"]) {
  if (action === "Увеличить") {
    return {
      className: "bg-emerald-100 text-emerald-900",
      icon: <ArrowUpRight aria-hidden="true" size={16} />
    };
  }

  if (action === "Снизить") {
    return {
      className: "bg-amber-100 text-amber-900",
      icon: <ArrowDownRight aria-hidden="true" size={16} />
    };
  }

  if (action === "Нет активного бюджета") {
    return {
      className: "bg-stone-100 text-stone-600",
      icon: <Minus aria-hidden="true" size={16} />
    };
  }

  return {
    className: "bg-leaf-soft text-emerald-900",
    icon: <Minus aria-hidden="true" size={16} />
  };
}

export function SkuBudgetPage({ data, onNavigate }: SkuBudgetPageProps) {
  const [selectedSku, setSelectedSku] = useState<string>("all");
  const [metric, setMetric] = useState<ChartMetric>("rub");

  const selected = useMemo(
    () =>
      selectedSku === "all"
        ? null
        : data.skus.find((sku) => sku.sku === selectedSku) ?? null,
    [data.skus, selectedSku]
  );

  const metrics: Metric[] = [
    {
      label: "Текущий факт",
      value: formatCurrency(data.overview.currentMonthly),
      description: "средний performance-бюджет в месяц"
    },
    {
      label: "Оптимум",
      value: formatCurrency(data.overview.recommendedMonthly),
      description: "рекомендованный бюджет при текущей частоте"
    },
    {
      label: "Разница",
      value: formatDelta(data.overview.deltaMonthly),
      description: "сколько добавить к текущему медиаплану"
    },
    {
      label: "SKU в анализе",
      value: String(data.overview.skuCount),
      description: `${formatNumber(data.overview.dailyPoints)} дневных точек`
    }
  ];

  const sortedSkus = useMemo(() => {
    return [...data.skus]
      .filter((sku) => sku.recommendedMonthly > 0)
      .sort((a, b) => b.recommendedMonthly - a.recommendedMonthly);
  }, [data.skus]);

  const selectableSkus = useMemo(() => {
    return data.skus.filter((sku) => sku.currentDaily > 0);
  }, [data.skus]);

  const selectedTone = selected ? actionTone(selected.action) : null;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <BackButton onClick={() => onNavigate("/")} />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-end">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-emerald-800">SKU-бюджет</p>
          <h1 className="text-3xl font-semibold leading-tight text-stone-950 sm:text-4xl">
            {data.title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-stone-700 sm:text-lg">
            {data.description}
          </p>
        </div>

        <div className="rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-leaf-soft text-emerald-800">
              <Info aria-hidden="true" size={20} />
            </span>
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-stone-950">
                Как читать страницу
              </h2>
              <p className="text-sm leading-6 text-stone-600">
                Выберите SKU, сравните текущую точку бюджета с рекомендованной и
                посмотрите, где продажи начинают насыщаться.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((item) => (
          <MetricCard key={item.label} metric={item} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="min-w-0 rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm">
          <label
            className="text-sm font-semibold text-emerald-900"
            htmlFor="sku-select"
          >
            SKU
          </label>
          <select
            id="sku-select"
            className="mt-2 w-full rounded-lg border border-emerald-950/15 bg-white px-3 py-3 text-sm font-medium text-stone-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
            value={selectedSku}
            onChange={(event) => setSelectedSku(event.target.value)}
          >
            <option value="all">Все SKU</option>
            {selectableSkus.map((sku) => (
              <option key={sku.sku} value={sku.sku}>
                {sku.sku} · {sku.shortName}
              </option>
            ))}
          </select>

          <div className="mt-5 space-y-4">
            {selected ? (
              <>
                <div>
                  <h2 className="text-xl font-semibold leading-snug text-stone-950">
                    {selected.shortName}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {selected.category} · Ozon ID {selected.sku}
                  </p>
                </div>

                {selectedTone ? (
                  <div
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${selectedTone.className}`}
                  >
                    {selectedTone.icon}
                    {selected.action}
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  <SkuMiniMetric
                    label="Сейчас / день"
                    value={formatCurrency(selected.currentDaily)}
                  />
                  <SkuMiniMetric
                    label="Реко / день"
                    value={formatCurrency(selected.recommendedDaily)}
                  />
                  <SkuMiniMetric
                    label="Сейчас / мес"
                    value={formatCurrency(selected.currentMonthly)}
                  />
                  <SkuMiniMetric
                    label="Реко / мес"
                    value={formatCurrency(selected.recommendedMonthly)}
                  />
                </div>

                <div className="rounded-lg bg-leaf-soft p-4">
                  <div className="text-sm font-semibold text-emerald-950">
                    Изменение бюджета
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-emerald-950">
                    {formatDelta(selected.deltaMonthly)}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-emerald-950/75">
                    {selected.recommendation}. {selected.status}.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <SkuRatio label="DRR" value={formatPercent(selected.drr)} />
                  <SkuRatio label="CR" value={formatPercent(selected.cr)} />
                  <SkuRatio label="CTR" value={formatPercent(selected.ctr)} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-xl font-semibold leading-snug text-stone-950">
                    Все SKU
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    На графике показаны все SKU с ненулевым рекомендованным
                    бюджетом. Для детализации выберите товар в списке.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <SkuMiniMetric
                    label="SKU на графике"
                    value={String(sortedSkus.length)}
                  />
                  <SkuMiniMetric
                    label="Реко / мес"
                    value={formatCurrency(data.overview.recommendedMonthly)}
                  />
                  <SkuMiniMetric
                    label="Сейчас / мес"
                    value={formatCurrency(data.overview.currentMonthly)}
                  />
                  <SkuMiniMetric
                    label="Разница"
                    value={formatDelta(data.overview.deltaMonthly)}
                  />
                </div>
              </>
            )}
          </div>
        </aside>

        <div className="min-w-0 rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-950">
                Бюджет в день и продажи
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Точки — фактические дни поддержки. Линия — модель насыщения, если
                она подтверждена в файле.
              </p>
            </div>
            <div className="grid grid-cols-2 rounded-lg bg-stone-100 p-1 text-sm font-semibold text-stone-700">
              <button
                type="button"
                className={`rounded-md px-3 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${
                  metric === "rub" ? "bg-white text-emerald-900 shadow-sm" : ""
                }`}
                onClick={() => setMetric("rub")}
              >
                ₽
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${
                  metric === "units" ? "bg-white text-emerald-900 shadow-sm" : ""
                }`}
                onClick={() => setMetric("units")}
              >
                шт
              </button>
            </div>
          </div>

          <BudgetResponseChart metric={metric} sku={selected} skus={sortedSkus} />
        </div>
      </div>

      <SkuSummaryTable skus={sortedSkus} />
    </section>
  );
}

function SkuMiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-950/10 bg-milk p-3">
      <div className="text-xs font-semibold text-stone-500">{label}</div>
      <div className="mt-1 text-base font-semibold text-stone-950">{value}</div>
    </div>
  );
}

function SkuRatio({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-stone-50 p-3">
      <div className="text-xs font-semibold text-stone-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-stone-950">{value}</div>
    </div>
  );
}

function BudgetResponseChart({
  metric,
  sku,
  skus
}: {
  metric: ChartMetric;
  sku: SkuBudgetItem | null;
  skus: SkuBudgetItem[];
}) {
  const [hoveredPoint, setHoveredPoint] = useState<SkuBudgetPoint | null>(null);

  const chart = useMemo(() => {
    const isAll = sku === null;
    const sourceSkus = isAll ? skus : sku ? [sku] : [];
    const yValue = (point: SkuBudgetPoint) =>
      metric === "rub" ? point.salesRub : point.salesUnits;
    const series = sourceSkus
      .map((item, index) => {
        const curve = item.curve.filter((point) => point.budget >= 0);
        const actual = isAll
          ? []
          : item.points.filter((point) => point.budget > 0);
        return {
          sku: item,
          curve,
          actual,
          color: chartColors[index % chartColors.length]
        };
      })
      .filter((item) => item.curve.length || item.actual.length);
    const xValues = [
      ...series.flatMap((item) => item.actual.map((point) => point.budget)),
      ...series.flatMap((item) => item.curve.map((point) => point.budget)),
      ...(sku ? [sku.currentDaily, sku.recommendedDaily] : [])
    ];
    const yValues = [
      ...series.flatMap((item) => item.actual.map(yValue)),
      ...series.flatMap((item) => item.curve.map(yValue)),
      ...(sku
        ? [
            yValueAtBudget(sku.curve, sku.currentDaily, metric),
            yValueAtBudget(sku.curve, sku.recommendedDaily, metric)
          ]
        : [])
    ];
    const maxX = Math.max(1, ...xValues) * 1.08;
    const maxY = Math.max(1, ...yValues) * 1.12;
    const currentTotal = sourceSkus.reduce(
      (sum, item) => sum + item.currentMonthly,
      0
    );
    const recommendedTotal = sourceSkus.reduce(
      (sum, item) => sum + item.recommendedMonthly,
      0
    );

    return { currentTotal, isAll, maxX, maxY, recommendedTotal, series, yValue };
  }, [metric, sku, skus]);

  const width = 720;
  const height = 380;
  const padding = { top: 24, right: 24, bottom: 54, left: 70 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const xScale = (value: number) => padding.left + (value / chart.maxX) * plotWidth;
  const yScale = (value: number) =>
    padding.top + plotHeight - (value / chart.maxY) * plotHeight;

  const yLabel = metric === "rub" ? "Продажи, ₽" : "Продажи, шт";
  const activeY = hoveredPoint
    ? metric === "rub"
      ? hoveredPoint.salesRub
      : hoveredPoint.salesUnits
    : null;
  const linePath = (points: SkuBudgetPoint[]) =>
    points
      .map((point, index) => {
      const x = xScale(point.budget);
      const y = yScale(metric === "rub" ? point.salesRub : point.salesUnits);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="mt-5">
      <div className="overflow-hidden rounded-lg bg-milk">
        <svg
          className="h-auto w-full"
          role="img"
          viewBox={`0 0 ${width} ${height}`}
          aria-label={
            sku
              ? `График зависимости бюджета и продаж для SKU ${sku.sku}`
              : "График зависимости бюджета и продаж для всех SKU"
          }
        >
          <rect width={width} height={height} fill="#F2EBE4" />
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = padding.top + plotHeight * tick;
            const value = chart.maxY * (1 - tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="#D9E7D0"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="#746F66"
                  fontSize="12"
                  textAnchor="end"
                >
                  {metric === "rub"
                    ? formatNumber(value / 1000) + "к"
                    : formatNumber(value)}
                </text>
              </g>
            );
          })}

          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const x = padding.left + plotWidth * tick;
            const value = chart.maxX * tick;
            return (
              <g key={tick}>
                <line
                  x1={x}
                  x2={x}
                  y1={padding.top}
                  y2={height - padding.bottom}
                  stroke="#E5DBD3"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - 20}
                  fill="#746F66"
                  fontSize="12"
                  textAnchor="middle"
                >
                  {formatNumber(value / 1000)}к
                </text>
              </g>
            );
          })}

          {chart.series.map((item) => {
            const path = linePath(item.curve);
            if (!path) {
              return null;
            }

            return (
              <path
                key={item.sku.sku}
                d={path}
                fill="none"
                opacity={chart.isAll ? "0.72" : "1"}
                stroke={item.color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={chart.isAll ? "2.5" : "4"}
              >
                <title>{item.sku.shortName}</title>
              </path>
            );
          })}

          {!chart.isAll && chart.series[0]?.actual.map((point, index) => {
            const y = metric === "rub" ? point.salesRub : point.salesUnits;
            return (
              <circle
                key={`${point.date}-${index}`}
                cx={xScale(point.budget)}
                cy={yScale(y)}
                r="4"
                fill="#99B487"
                opacity="0.42"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <title>
                  {point.date}: бюджет {formatCurrency(point.budget)}, {yLabel}{" "}
                  {metric === "rub" ? formatCurrency(y) : formatNumber(y)}
                </title>
              </circle>
            );
          })}

          {sku ? (
            <>
              <BudgetMarker
                label="Сейчас"
                x={xScale(sku.currentDaily)}
                y={padding.top}
                bottom={height - padding.bottom}
                color="#D292A0"
              />
              <BudgetMarker
                label="Реко"
                x={xScale(sku.recommendedDaily)}
                y={padding.top}
                bottom={height - padding.bottom}
                color="#548235"
              />
            </>
          ) : null}

          <text x={padding.left} y={18} fill="#305020" fontSize="13" fontWeight="700">
            {yLabel}
          </text>
          <text
            x={width - padding.right}
            y={height - 4}
            fill="#305020"
            fontSize="13"
            fontWeight="700"
            textAnchor="end"
          >
            Бюджет / день
          </text>
        </svg>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {chart.isAll ? (
          <>
            <ChartLegend
              color="#548235"
              label="Линии SKU"
              value={`${formatNumber(chart.series.length)} товаров`}
            />
            <ChartLegend
              color="#D292A0"
              label="Текущий бюджет"
              value={formatCurrency(chart.currentTotal)}
            />
            <ChartLegend
              color="#548235"
              label="Рекомендовано"
              value={formatCurrency(chart.recommendedTotal)}
            />
          </>
        ) : sku ? (
          <>
            <ChartLegend
              color="#99B487"
              label="Фактические дни"
              value={`${formatNumber(sku.points.length)} точек`}
            />
            <ChartLegend
              color="#D292A0"
              label="Текущий бюджет"
              value={formatCurrency(sku.currentDaily)}
            />
            <ChartLegend
              color="#548235"
              label="Оптимальная точка"
              value={formatCurrency(sku.recommendedDaily)}
            />
          </>
        ) : null}
      </div>

      <div className="mt-4 rounded-lg bg-stone-50 p-4 text-sm leading-6 text-stone-600">
        {chart.isAll ? (
          <>
            Общий график показывает модельные кривые SKU с ненулевым
            рекомендованным бюджетом. Для фактических дневных точек выберите
            конкретный товар.
          </>
        ) : hoveredPoint ? (
          <>
            {hoveredPoint.date}: бюджет {formatCurrency(hoveredPoint.budget)},{" "}
            {yLabel.toLowerCase()}{" "}
            {activeY !== null && metric === "rub"
              ? formatCurrency(activeY)
              : activeY !== null
                ? formatNumber(activeY)
                : ""}
          </>
        ) : (
          <>
            {sku ? (
              <>
                Средняя цена продажи в модели:{" "}
                {formatCurrency(sku.averageUnitPrice)}. R² fit:{" "}
                {sku.r2.toFixed(2)}.
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function yValueAtBudget(
  curve: SkuBudgetPoint[],
  budget: number,
  metric: ChartMetric
) {
  if (!curve.length) {
    return 0;
  }

  const point = curve.reduce((closest, current) => {
    return Math.abs(current.budget - budget) < Math.abs(closest.budget - budget)
      ? current
      : closest;
  }, curve[0]);

  return metric === "rub" ? point.salesRub : point.salesUnits;
}

function BudgetMarker({
  bottom,
  color,
  label,
  x,
  y
}: {
  bottom: number;
  color: string;
  label: string;
  x: number;
  y: number;
}) {
  return (
    <g>
      <line
        x1={x}
        x2={x}
        y1={y}
        y2={bottom}
        stroke={color}
        strokeDasharray="6 7"
        strokeWidth="2"
      />
      <rect x={x - 30} y={y + 8} width="60" height="24" rx="6" fill={color} />
      <text
        x={x}
        y={y + 24}
        fill="#FFFFFF"
        fontSize="12"
        fontWeight="700"
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
}

function ChartLegend({
  color,
  label,
  value
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-emerald-950/10 bg-white p-3">
      <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: color }} />
      <div className="min-w-0">
        <div className="text-xs font-semibold text-stone-500">{label}</div>
        <div className="truncate text-sm font-semibold text-stone-950">{value}</div>
      </div>
    </div>
  );
}

function SkuSummaryTable({ skus }: { skus: SkuBudgetItem[] }) {
  const visibleSkus = [...skus]
    .filter((sku) => sku.recommendedDaily > 0)
    .sort((a, b) => b.recommendedDaily - a.recommendedDaily);

  return (
    <div className="min-w-0 rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-leaf-soft text-emerald-800">
          <PackageSearch aria-hidden="true" size={20} />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-stone-950">
            Сводная таблица рекомендаций
          </h2>
          <p className="text-sm leading-6 text-stone-600">
            Отсортировано по размеру изменения бюджета.
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[560px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-emerald-950/10 bg-leaf-soft">
              <th className="px-4 py-3 font-semibold text-emerald-950" scope="col">
                Товар
              </th>
              <th className="px-4 py-3 font-semibold text-emerald-950" scope="col">
                Рекомендованный бюджет в день
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleSkus.map((sku) => (
              <tr key={sku.sku} className="border-b border-emerald-950/10">
                <td className="px-4 py-3 align-top leading-6 text-stone-700">
                  <span className="block font-semibold text-stone-950">
                    {sku.shortName}
                  </span>
                  <span className="mt-1 block text-xs font-medium text-stone-500">
                    Ozon ID {sku.sku}
                  </span>
                </td>
                <td className="px-4 py-3 align-top font-semibold text-stone-950">
                  {formatCurrency(sku.recommendedDaily)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
