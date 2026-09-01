import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-border bg-card/80 shadow-panel backdrop-blur ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div>
            {title && (
              <h2 className="font-mono text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-input bg-background/70 px-3 py-2 font-mono text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40";

export function Btn({
  children,
  variant = "primary",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "accent" }) {
  const styles = {
    primary:
      "bg-primary text-primary-foreground hover:brightness-110 shadow-glow",
    accent: "bg-accent text-accent-foreground hover:brightness-110",
    ghost: "border border-border bg-transparent text-foreground hover:bg-muted/60",
  }[variant];
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Stat({ label, value, tone = "default" }: { label: string; value: ReactNode; tone?: "default" | "up" | "down" | "accent" }) {
  const toneClass = {
    default: "text-foreground",
    up: "text-success",
    down: "text-destructive",
    accent: "text-accent",
  }[tone];
  return (
    <div className="rounded-lg border border-border bg-background/40 px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 break-words font-mono text-sm ${toneClass}`}>{value}</div>
    </div>
  );
}

export function Collapse({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border bg-background/40">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground"
      >
        {title}
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-border px-4 py-4">{children}</div>}
    </div>
  );
}

export function Chip({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-border bg-muted/40 px-3 py-1 font-mono text-xs text-foreground transition hover:border-primary hover:text-primary"
    >
      {children}
    </button>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  );
}
