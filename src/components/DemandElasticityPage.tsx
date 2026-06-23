import { Calculator, LineChart, PackageSearch } from "lucide-react";
import { BackButton } from "./BackButton";
import type {
  DemandElasticityData,
  ElasticityCategory,
  ElasticityScenarioRow,
  ElasticityTopSku
} from "../types";

type DemandElasticityPageProps = {
  data: DemandElasticityData;
  onNavigate: (path: string) => void;
};

const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  currency: "RUB",
  maximumFractionDigits: 0,
  style: "currency"
});

const numberFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0
});

const decimalFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2
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

function formatDecimal(value: number) {
  return decimalFormatter.format(value);
}

function formatPercent(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${percentFormatter.format(value * 100)}%`;
}

function formatShare(value: number) {
  return `${percentFormatter.format(value * 100)}%`;
}

function categoryColor(key: ElasticityCategory["key"]) {
  if (key === "icecream") {
    return "#954F72";
  }

  if (key === "magnum") {
    return "#A85D2D";
  }

  return "#C78655";
}

export function DemandElasticityPage({
  data,
  onNavigate
}: DemandElasticityPageProps) {
  const category = data.categories[0];

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <BackButton onClick={() => onNavigate("/")} />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.74fr] lg:items-end">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-emerald-800">
            Эластичность
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-stone-950 sm:text-4xl">
            {data.title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-stone-700 sm:text-lg">
            {data.description}
          </p>
          <p className="text-sm font-medium text-stone-500">
            Период: {data.period}
          </p>
        </div>

        <div className="rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-leaf-soft text-emerald-800">
              <Calculator aria-hidden="true" size={22} />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-stone-500">
                Коэффициент эластичности
              </p>
              <h2 className="mt-1 text-3xl font-semibold text-stone-950">
                {formatDecimal(data.overall.elasticity)}
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Значение ниже -1: спрос чувствителен к цене, поэтому сценарии
                ниже лучше читать вместе с выручкой и объемом продаж.
              </p>
            </div>
          </div>
        </div>
      </div>

      {category ? (
        <>
          <ScenarioChart category={category} />
          <ScenarioTable category={category} />
        </>
      ) : null}

      <TopSkuTable skus={data.topSkus} />
    </section>
  );
}

function ScenarioChart({ category }: { category: ElasticityCategory }) {
  const scenarios = [...category.scenarioRows].sort(
    (a, b) => a.newAveragePrice - b.newAveragePrice
  );
  const baseScenario =
    scenarios.find((row) => Math.abs(row.priceChange) < 0.0001) ??
    scenarios[Math.floor(scenarios.length / 2)];
  const minPrice = Math.min(...scenarios.map((row) => row.newAveragePrice));
  const maxPrice = Math.max(...scenarios.map((row) => row.newAveragePrice));
  const minUnits = Math.min(...scenarios.map((row) => row.expectedDailyUnits));
  const maxUnits = Math.max(...scenarios.map((row) => row.expectedDailyUnits));
  const pricePadding = (maxPrice - minPrice) * 0.08 || 1;
  const width = 720;
  const height = 390;
  const padding = { top: 28, right: 24, bottom: 76, left: 78 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const xMin = minPrice - pricePadding;
  const xMax = maxPrice + pricePadding;
  const yMin = Math.max(0, Math.floor((minUnits * 0.86) / 50) * 50);
  const yMax = Math.ceil((maxUnits * 1.08) / 50) * 50;
  const yTicks = [yMin, yMin + (yMax - yMin) / 4, yMin + (yMax - yMin) / 2, yMin + ((yMax - yMin) * 3) / 4, yMax];

  const xScale = (value: number) =>
    padding.left + ((value - xMin) / (xMax - xMin)) * plotWidth;
  const yScale = (value: number) =>
    padding.top + ((yMax - value) / (yMax - yMin)) * plotHeight;

  const curvePoints = Array.from({ length: 96 }, (_, index) => {
    const price = minPrice + ((maxPrice - minPrice) * index) / 95;
    const units =
      baseScenario.expectedDailyUnits *
      Math.pow(price / baseScenario.newAveragePrice, category.summary.elasticity);
    return { price, units };
  });

  const path = curvePoints
    .map((point, index) => {
      const x = xScale(point.price);
      const y = yScale(point.units);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const baseY = yScale(baseScenario.expectedDailyUnits);
  const baseX = xScale(baseScenario.newAveragePrice);
  const color = categoryColor(category.key);

  return (
    <div className="min-w-0 rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-stone-950">
          Ожидаемые продажи в штуках
        </h2>
        <p className="mt-1 text-sm leading-6 text-stone-600">
          График показывает расчетный дневной объем продаж при разных средних ценах.
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg bg-milk">
        <svg
          className="h-auto w-full"
          role="img"
          viewBox={`0 0 ${width} ${height}`}
          aria-label="Сценарный график эластичности"
        >
          <rect width={width} height={height} fill="#F2EBE4" />
          {scenarios.map((row) => {
            const x = xScale(row.newAveragePrice);
            return (
              <g key={`${row.scenario}-x-axis`}>
                <line
                  x1={x}
                  x2={x}
                  y1={padding.top}
                  y2={height - padding.bottom}
                  stroke={Math.abs(row.priceChange) < 0.0001 ? "#305020" : "#E5DBD3"}
                  strokeWidth={Math.abs(row.priceChange) < 0.0001 ? 1.5 : 1}
                />
                <text
                  x={x}
                  y={height - 38}
                  fill="#746F66"
                  fontSize="12"
                  textAnchor="middle"
                >
                  {formatCurrency(row.newAveragePrice)}
                </text>
                <text
                  x={x}
                  y={height - 20}
                  fill="#746F66"
                  fontSize="11"
                  textAnchor="middle"
                >
                  {Math.abs(row.priceChange) < 0.0001
                    ? "База"
                    : formatPercent(row.priceChange)}
                </text>
              </g>
            );
          })}

          {yTicks.map((tick) => {
            const y = yScale(tick);
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
                  {formatNumber(tick)}
                </text>
              </g>
            );
          })}

          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={baseY}
            y2={baseY}
            stroke="#305020"
            strokeDasharray="6 6"
            strokeWidth="1.5"
          />
          <line
            x1={baseX}
            x2={baseX}
            y1={padding.top}
            y2={height - padding.bottom}
            stroke="#305020"
            strokeDasharray="6 6"
            strokeWidth="1.5"
          />

          <path
            d={path}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />

          {scenarios.map((row) => {
            const x = xScale(row.newAveragePrice);
            const y = yScale(row.expectedDailyUnits);
            const labelY = row.priceChange > 0 ? y + 24 : y - 14;
            return (
              <g key={row.scenario}>
                <circle cx={x} cy={y} r="8" fill={color} />
                <circle cx={x} cy={y} r="3" fill="#FFFFFF" />
                <text
                  x={x}
                  y={labelY}
                  fill="#2A1409"
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {formatNumber(row.expectedDailyUnits)}
                </text>
                <title>
                  {row.scenario}: {formatNumber(row.expectedDailyUnits)} шт/день
                </title>
              </g>
            );
          })}

          <text x={padding.left} y={18} fill="#305020" fontSize="13" fontWeight="700">
            Продажи, шт/день
          </text>
          <text
            x={width - padding.right}
            y={height - 4}
            fill="#305020"
            fontSize="13"
            fontWeight="700"
            textAnchor="end"
          >
            Средняя цена, ₽
          </text>
          <text x={baseX + 8} y={padding.top + 14} fill="#305020" fontSize="12">
            текущая цена
          </text>
          <text x={padding.left + 8} y={baseY - 8} fill="#305020" fontSize="12">
            базовый объем: {formatNumber(baseScenario.expectedDailyUnits)} шт/день
          </text>
        </svg>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <ChartLegend color={color} label="Функция спроса" value="расчет в штуках" />
        <ChartLegend
          color="#305020"
          label="Текущий уровень"
          value={`${formatNumber(baseScenario.expectedDailyUnits)} шт/день`}
        />
      </div>
    </div>
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
      <span
        className="h-3 w-3 shrink-0 rounded-full ring-1 ring-emerald-950/10"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0">
        <div className="text-xs font-semibold text-stone-500">{label}</div>
        <div className="truncate text-sm font-semibold text-stone-950">{value}</div>
      </div>
    </div>
  );
}

function ScenarioTable({ category }: { category: ElasticityCategory }) {
  const hasMargin = category.scenarioRows.some(
    (row) => row.marginPerUnit !== null || row.dailyMargin !== null
  );

  return (
    <div className="min-w-0 rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-leaf-soft text-emerald-800">
          <LineChart aria-hidden="true" size={20} />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-stone-950">
            Сценарии
          </h2>
          <p className="text-sm leading-6 text-stone-600">
            Сценарии изменения цены из итоговой таблицы модели.
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[940px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-emerald-950/10 bg-leaf-soft">
              <ScenarioHead>Сценарий</ScenarioHead>
              <ScenarioHead>Цена</ScenarioHead>
              <ScenarioHead>Средняя цена</ScenarioHead>
              <ScenarioHead>Продажи</ScenarioHead>
              <ScenarioHead>Год, шт</ScenarioHead>
              <ScenarioHead>День, шт</ScenarioHead>
              <ScenarioHead>Выручка / день</ScenarioHead>
              {hasMargin ? <ScenarioHead>Маржа / день</ScenarioHead> : null}
              <ScenarioHead>Оценка</ScenarioHead>
            </tr>
          </thead>
          <tbody>
            {category.scenarioRows.map((row) => (
              <ScenarioTableRow key={row.scenario} hasMargin={hasMargin} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScenarioHead({ children }: { children: string }) {
  return (
    <th className="px-4 py-3 font-semibold text-emerald-950" scope="col">
      {children}
    </th>
  );
}

function ScenarioTableRow({
  hasMargin,
  row
}: {
  hasMargin: boolean;
  row: ElasticityScenarioRow;
}) {
  return (
    <tr className="border-b border-emerald-950/10">
      <td className="px-4 py-3 font-semibold text-stone-950">{row.scenario}</td>
      <td className="px-4 py-3 text-stone-700">{formatPercent(row.priceChange)}</td>
      <td className="px-4 py-3 text-stone-700">
        {formatCurrency(row.newAveragePrice)}
      </td>
      <td
        className={`px-4 py-3 font-semibold ${
          row.expectedSalesChange >= 0 ? "text-emerald-800" : "text-rose-800"
        }`}
      >
        {formatPercent(row.expectedSalesChange)}
      </td>
      <td className="px-4 py-3 text-stone-700">
        {formatNumber(row.expectedAnnualUnits)}
      </td>
      <td className="px-4 py-3 text-stone-700">
        {formatNumber(row.expectedDailyUnits)}
      </td>
      <td className="px-4 py-3 text-stone-700">
        {formatCurrency(row.dailyRevenue)}
      </td>
      {hasMargin ? (
        <td className="px-4 py-3 text-stone-700">
          {row.dailyMargin !== null ? formatCurrency(row.dailyMargin) : "-"}
        </td>
      ) : null}
      <td className="px-4 py-3 text-stone-600">{row.businessReadout}</td>
    </tr>
  );
}

function TopSkuTable({ skus }: { skus: ElasticityTopSku[] }) {
  if (!skus.length) {
    return null;
  }

  const visibleSkus = skus.slice(0, 10);

  return (
    <div className="min-w-0 rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-leaf-soft text-emerald-800">
          <PackageSearch aria-hidden="true" size={20} />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-stone-950">
            Топ SKU в выборке
          </h2>
          <p className="text-sm leading-6 text-stone-600">
            Позиции с наибольшим вкладом в продажи и выручку за период модели.
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[920px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-emerald-950/10 bg-leaf-soft">
              <ScenarioHead>SKU</ScenarioHead>
              <ScenarioHead>Продажи, шт</ScenarioHead>
              <ScenarioHead>Выручка</ScenarioHead>
              <ScenarioHead>Доля шт</ScenarioHead>
              <ScenarioHead>Доля выручки</ScenarioHead>
              <ScenarioHead>Средняя цена</ScenarioHead>
              <ScenarioHead>Дней продаж</ScenarioHead>
            </tr>
          </thead>
          <tbody>
            {visibleSkus.map((sku) => (
              <tr key={`${sku.barcode}-${sku.code}`} className="border-b border-emerald-950/10">
                <td className="px-4 py-3 align-top leading-6 text-stone-700">
                  <span className="block max-w-md font-semibold text-stone-950">
                    {sku.label}
                  </span>
                  <span className="mt-1 block text-xs font-medium text-stone-500">
                    barcode {sku.barcode} · code {sku.code}
                  </span>
                </td>
                <td className="px-4 py-3 align-top text-stone-700">
                  {formatNumber(sku.sellOutQty)}
                </td>
                <td className="px-4 py-3 align-top text-stone-700">
                  {formatCurrency(sku.revenue)}
                </td>
                <td className="px-4 py-3 align-top font-semibold text-emerald-900">
                  {formatShare(sku.qtyShare)}
                </td>
                <td className="px-4 py-3 align-top font-semibold text-emerald-900">
                  {formatShare(sku.revenueShare)}
                </td>
                <td className="px-4 py-3 align-top text-stone-700">
                  {formatCurrency(sku.averagePrice)}
                </td>
                <td className="px-4 py-3 align-top text-stone-700">
                  {formatNumber(sku.daysWithSales)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
