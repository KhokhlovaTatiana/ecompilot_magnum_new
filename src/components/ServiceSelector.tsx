import { ServiceCard } from "./ServiceCard";
import type { ServiceSummary } from "../types";

type ServiceSelectorProps = {
  services: ServiceSummary[];
  onNavigate: (path: string) => void;
};

export function ServiceSelector({ services, onNavigate }: ServiceSelectorProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="overflow-hidden rounded-lg bg-emerald-950 text-white shadow-[0_28px_80px_rgba(42,20,9,0.24)]">
        <div className="grid min-h-[380px] gap-0 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="flex flex-col justify-between gap-6 p-6 sm:p-8 lg:p-9">
            <div className="flex w-fit items-center gap-3 rounded-lg bg-white/10 px-3 py-2 ring-1 ring-white/20">
              <img
                src="/assets/design/magnat-template/template-media-06-0d5583c7fe.png"
                alt="Магнат"
                className="h-9 w-9 rounded-md object-cover"
              />
              <span className="text-sm font-semibold text-white/86">
                EcomPilot для Магнат
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Дополнительные материалы к презентации
              </h1>
              <p className="max-w-xl text-lg leading-8 text-white/78">
                Выберите сервис, чтобы посмотреть данные и инсайты.
              </p>
            </div>

          </div>

          <div className="relative min-h-[220px] bg-[#3b1b10] sm:min-h-[260px] lg:min-h-0">
            <img
              src="/assets/design/magnat-template/template-media-04-e5d25167d9.png"
              alt="Мороженое Магнат в шоколаде"
              className="absolute inset-0 h-full w-full object-cover object-[58%_36%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/18 to-transparent lg:bg-gradient-to-r lg:from-emerald-950/40 lg:via-transparent lg:to-transparent" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </section>
  );
}
