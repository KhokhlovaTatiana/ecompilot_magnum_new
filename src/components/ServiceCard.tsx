import {
  BarChart3,
  ChevronRight,
  LineChart,
  Route,
  UsersRound,
  WalletCards
} from "lucide-react";
import type { ServiceSummary } from "../types";

type ServiceCardProps = {
  service: ServiceSummary;
  onNavigate: (path: string) => void;
};

const iconMap = {
  algorithm: Route,
  audience: UsersRound,
  elasticity: LineChart,
  budget: WalletCards
};

export function ServiceCard({ service, onNavigate }: ServiceCardProps) {
  const Icon = iconMap[service.icon] ?? BarChart3;
  const isReady = service.status === "ready";

  return (
    <a
      href={service.path}
      className="group flex min-h-[124px] items-center justify-between gap-4 rounded-lg border border-emerald-950/10 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-700/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 focus-visible:ring-offset-linen active:translate-y-0 sm:p-5"
      onClick={(event) => {
        event.preventDefault();
        onNavigate(service.path);
      }}
    >
      <span className="flex min-w-0 flex-1 gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-leaf-soft text-emerald-800 transition group-hover:bg-emerald-700 group-hover:text-white">
          <Icon aria-hidden="true" size={22} strokeWidth={2} />
        </span>
        <span className="min-w-0 space-y-2">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold leading-snug text-stone-950 sm:text-xl">
              {service.title}
            </span>
            <span
              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                isReady
                  ? "bg-emerald-100 text-emerald-900"
                  : "bg-stone-100 text-stone-600"
              }`}
            >
              {isReady ? "готово" : "скоро"}
            </span>
          </span>
          <span className="block max-w-[34rem] text-sm leading-6 text-stone-600">
            {service.description}
          </span>
        </span>
      </span>
      <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-950/10 text-emerald-800 transition group-hover:border-emerald-700 group-hover:bg-emerald-700 group-hover:text-white">
        <ChevronRight aria-hidden="true" size={20} />
      </span>
    </a>
  );
}
