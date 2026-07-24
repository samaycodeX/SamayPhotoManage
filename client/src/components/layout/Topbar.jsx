export function Topbar({ title, subtitle, email }) {
  const initial = email?.[0]?.toUpperCase() || 'A';

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/80 px-8 py-4 backdrop-blur-sm">
      <div>
        <h1 className="text-lg font-semibold text-primary">{title}</h1>
        {subtitle && <p className="text-sm text-secondary">{subtitle}</p>}
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
        {initial}
      </div>
    </header>
  );
}
