import {
  BarChart3,
  Heart,
  Home,
  ShoppingBasket,
  Sparkles,
  UserRoundCheck,
  UsersRound
} from "lucide-react";
import { BackButton } from "./BackButton";
import { MetricCard } from "./MetricCard";
import type {
  AudienceCategoryItem,
  AudiencePortraitData,
  AudienceProfileSignal
} from "../types";

type AudiencePortraitPageProps = {
  data: AudiencePortraitData;
  onNavigate: (path: string) => void;
};

const numberFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0
});

const signalIcons = [UserRoundCheck, UsersRound, Home, Heart] as const;

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function AudiencePortraitPage({
  data,
  onNavigate
}: AudiencePortraitPageProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <BackButton onClick={() => onNavigate("/")} />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.78fr] lg:items-stretch">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-emerald-800">
            Портрет аудитории
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-stone-950 sm:text-4xl">
            {data.title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-stone-700 sm:text-lg">
            {data.description}
          </p>
          <p className="text-sm font-medium text-stone-500">
            Период данных: {data.period}
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-emerald-950/10 bg-white shadow-sm">
          <img
            src={data.image}
            alt="Покупательница Магнат изучает заказ на телефоне"
            className="aspect-[4/3] h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-stone-950">
            Кто эта аудитория
          </h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            Агрегированные признаки по именам и другим покупкам авторов отзывов.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.profileSignals.map((signal, index) => {
            const Icon = signalIcons[index % signalIcons.length];

            return (
              <SignalCard key={signal.title} signal={signal} icon={Icon} />
            );
          })}
        </div>
      </section>

      <CategoryBlock items={data.categoryMix} />

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-stone-950">
            Что говорят другие товары
          </h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            Интерпретация не по оценкам Магнат, а по соседним покупкам аудитории.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {data.lifestyleInsights.map((insight) => (
            <article
              key={insight.title}
              className="rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-leaf-soft text-emerald-800">
                <Sparkles aria-hidden="true" size={20} />
              </span>
              <h3 className="mt-4 text-xl font-semibold text-stone-950">
                {insight.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {insight.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="rounded-lg border border-emerald-950/10 bg-emerald-900 p-5 text-white shadow-sm">
        <h2 className="text-xl font-semibold">Что учесть в коммуникации</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {data.watchouts.map((item) => (
            <div
              key={item}
              className="rounded-lg bg-white/10 p-4 text-sm leading-6 ring-1 ring-white/15"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SignalCard({
  icon: Icon,
  signal
}: {
  icon: typeof UserRoundCheck;
  signal: AudienceProfileSignal;
}) {
  return (
    <article className="rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-leaf-soft text-emerald-800">
          <Icon aria-hidden="true" size={20} />
        </span>
        <span className="text-3xl font-semibold leading-none text-stone-950">
          {signal.value}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-stone-950">
        {signal.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{signal.text}</p>
    </article>
  );
}

function CategoryBlock({ items }: { items: AudienceCategoryItem[] }) {
  const maxShare = Math.max(1, ...items.map((item) => item.share));

  return (
    <section className="rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-leaf-soft text-emerald-800">
            <ShoppingBasket aria-hidden="true" size={20} />
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-stone-950">
              Категории других покупок
            </h2>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              Доля авторов, у которых есть хотя бы один отзыв в категории; товары
              Магнат исключены из расчета.
            </p>
          </div>
        </div>
        <span className="flex w-fit items-center gap-2 rounded-lg bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700 ring-1 ring-emerald-950/10">
          <BarChart3 aria-hidden="true" size={18} />
          по авторам
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <article key={item.label} className="rounded-lg bg-stone-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-stone-950">
                  {item.label}
                </h3>
                <p className="mt-1 text-xs leading-5 text-stone-500">
                  {formatNumber(item.count)} авторов ·{" "}
                  {formatNumber(item.reviews)} отзывов
                </p>
              </div>
              <span className="text-2xl font-semibold leading-none text-stone-950">
                {item.share}%
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
              <span
                className="block h-full rounded-full bg-emerald-800"
                style={{ width: `${Math.max(6, (item.share / maxShare) * 100)}%` }}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {item.examples.map((example) => (
                <span
                  key={example}
                  className="rounded-md bg-white px-2 py-1 text-xs leading-5 text-stone-600 ring-1 ring-emerald-950/10"
                >
                  {example}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
