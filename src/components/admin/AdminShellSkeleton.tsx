function AdminShellSkeleton() {
  return (
    <div
      className="flex min-h-svh bg-muted/40"
      aria-busy="true"
      aria-live="polite"
    >
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background lg:flex">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <span className="size-8 rounded-lg bg-muted" />
          <span className="space-y-1">
            <span className="block h-3.5 w-16 rounded bg-muted" />
            <span className="block h-3 w-10 rounded bg-muted" />
          </span>
        </div>
        <div className="space-y-2 p-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-9 rounded-lg bg-muted/60" />
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur lg:px-6">
          <span className="h-5 w-32 rounded bg-muted" />
          <span className="ml-auto h-4 w-40 rounded bg-muted" />
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <span className="block h-8 w-48 rounded bg-muted" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-28 rounded-xl bg-muted/60" />
            ))}
          </div>
        </main>
      </div>

      <span className="sr-only">Loading admin dashboard</span>
    </div>
  );
}

export { AdminShellSkeleton };
