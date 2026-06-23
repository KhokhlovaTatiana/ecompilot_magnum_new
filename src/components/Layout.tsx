import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
  onNavigate: (path: string) => void;
};

export function Layout({ children, onNavigate }: LayoutProps) {
  return (
    <div className="site-shell min-h-screen text-stone-950">
      <header className="sticky top-0 z-40 border-b border-emerald-950/10 bg-linen/92 shadow-[0_10px_34px_rgba(42,20,9,0.10)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a
            href="/"
            aria-label="EcomPilot"
            className="flex min-w-0 items-center gap-3 rounded-lg bg-white/80 px-3 py-2 shadow-sm outline-none ring-1 ring-emerald-950/10 transition hover:ring-emerald-700/25 focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 focus-visible:ring-offset-linen"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("/");
            }}
          >
            <img
              src="/assets/ecompilot-dark-transparent.svg"
              alt="EcomPilot"
              className="h-7 w-auto sm:h-8"
            />
          </a>
          <div className="hidden items-center gap-2 rounded-lg bg-white/78 px-3 py-2 text-sm font-semibold text-emerald-900 ring-1 ring-emerald-950/10 sm:flex">
            <img
              src="/assets/design/magnat-template/template-media-06-0d5583c7fe.png"
              alt=""
              className="h-7 w-7 rounded-md object-cover"
              aria-hidden="true"
            />
            <span>Магнат</span>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
