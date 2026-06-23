import { TriangleAlert } from "lucide-react";

type ErrorStateProps = {
  title: string;
  message: string;
};

export function ErrorState({ title, message }: ErrorStateProps) {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-rose-200 bg-white p-6 shadow-sm">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
            <TriangleAlert aria-hidden="true" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-stone-950">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">{message}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
