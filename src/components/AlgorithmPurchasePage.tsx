import { ExternalLink, Layers3 } from "lucide-react";
import { BackButton } from "./BackButton";
import type {
  AlgorithmCategorySplit,
  AlgorithmPurchaseData,
  AlgorithmType
} from "../types";

type AlgorithmPurchasePageProps = {
  data: AlgorithmPurchaseData;
  onNavigate: (path: string) => void;
};

const sourceResearchUrl = "https://disk.360.yandex.ru/i/DRLua0js_EL-kQ";

const algorithmOrder: AlgorithmType["key"][] = [
  "alpha",
  "beta",
  "omega",
  "sigma"
];

const shareFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1
});

const algorithmColors: Record<AlgorithmType["key"], string> = {
  alpha: "#A95D2C",
  beta: "#954F72",
  omega: "#C78655",
  sigma: "#2A1409"
};

const algorithmSoftColors: Record<AlgorithmType["key"], string> = {
  alpha: "#F4DFCB",
  beta: "#F6E3EC",
  omega: "#FFF3E8",
  sigma: "#EAD7C7"
};

function formatShare(value: number) {
  return `${shareFormatter.format(value)}%`;
}

export function AlgorithmPurchasePage({
  data,
  onNavigate
}: AlgorithmPurchasePageProps) {
  const orderedAlgorithms = algorithmOrder
    .map((key) => data.algorithms.find((algorithm) => algorithm.key === key))
    .filter((algorithm): algorithm is AlgorithmType => Boolean(algorithm));

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <BackButton onClick={() => onNavigate("/")} />

      <div className="max-w-3xl space-y-4">
        <p className="text-sm font-semibold text-emerald-800">
          Алгоритмы покупки
        </p>
        <h1 className="text-3xl font-semibold leading-tight text-stone-950 sm:text-4xl">
          {data.title}
        </h1>
        <p className="text-base leading-7 text-stone-700 sm:text-lg">
          {data.description}
        </p>
      </div>

      <AlgorithmGrid
        algorithms={orderedAlgorithms}
        split={data.categorySplit}
      />

      <SourceDownloadLink href={data.sourceUrl ?? sourceResearchUrl} />
    </section>
  );
}

function AlgorithmGrid({
  algorithms,
  split
}: {
  algorithms: AlgorithmType[];
  split: AlgorithmCategorySplit;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-leaf-soft text-emerald-800">
          <Layers3 aria-hidden="true" size={20} />
        </span>
        <div>
          <h2 className="text-2xl font-semibold text-stone-950">
            Четыре режима выбора
          </h2>
          <p className="text-sm leading-6 text-stone-600">
            Крупная цифра показывает долю алгоритма на рынке продуктов питания,
            ниже добавлена характерная доля для мороженого.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {algorithms.map((algorithm) => (
          <article
            key={algorithm.key}
            className="flex h-full flex-col overflow-hidden rounded-lg border border-emerald-950/10 bg-white shadow-sm"
          >
            <div
              className="flex min-h-40 flex-col justify-between gap-5 p-5"
              style={{ backgroundColor: algorithmSoftColors[algorithm.key] }}
            >
              <div>
                <h3 className="text-2xl font-semibold leading-tight text-stone-950">
                  {algorithm.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-700">
                  {algorithm.shortDefinition}
                </p>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">
                  Рынок
                </div>
                <div
                  className="text-4xl font-semibold"
                  style={{ color: algorithmColors[algorithm.key] }}
                >
                  {formatShare(algorithm.share)}
                </div>
                <div className="mt-2 inline-flex items-baseline gap-2 rounded-lg bg-white/70 px-3 py-2 ring-1 ring-black/5">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">
                    Мороженое
                  </span>
                  <span className="text-2xl font-semibold text-stone-950">
                    {formatShare(split[algorithm.key])}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 p-5">
              <p className="text-sm leading-6 text-stone-600">
                {algorithm.description}
              </p>

              <div className="grid gap-2 text-sm">
                <AlgorithmFact label="Бренд" value={algorithm.brandRole} />
                <AlgorithmFact label="Продукт" value={algorithm.productRole} />
                <AlgorithmFact
                  label="Цена"
                  value={algorithm.priceElasticity}
                />
              </div>

              <div className="mt-auto space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">
                  Где чаще встречается
                </div>
                <ul className="space-y-1">
                  {algorithm.examples.slice(0, 4).map((item) => (
                    <li
                      key={item}
                      className="text-sm leading-5 text-stone-600 before:mr-2 before:text-emerald-700 before:content-['•']"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function AlgorithmFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-stone-50 px-3 py-2">
      <span className="font-semibold text-emerald-900">{label}: </span>
      <span className="text-stone-700">{value}</span>
    </div>
  );
}

function SourceDownloadLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="group flex flex-col gap-3 rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-700/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 focus-visible:ring-offset-linen sm:flex-row sm:items-center sm:justify-between"
      target="_blank"
      rel="noreferrer"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-leaf-soft text-emerald-800">
          <ExternalLink aria-hidden="true" size={20} />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-semibold text-stone-950">
            Скачать исходное исследование
          </span>
          <span className="block truncate text-sm text-stone-600">{href}</span>
        </span>
      </span>
      <span className="text-sm font-semibold text-emerald-900 transition group-hover:text-emerald-700">
        Открыть
      </span>
    </a>
  );
}
