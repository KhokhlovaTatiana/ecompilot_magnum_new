type LoadingStateProps = {
  label: string;
};

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <section className="mx-auto flex min-h-[50vh] w-full max-w-4xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 rounded-lg border border-emerald-950/10 bg-white px-5 py-4 text-sm font-semibold text-emerald-900 shadow-sm">
        <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-600" />
        {label}
      </div>
    </section>
  );
}
