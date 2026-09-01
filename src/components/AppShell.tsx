import { Link } from "@tanstack/react-router";
import { Activity, BookOpen, Boxes, Grid3x3, Home, Info, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/module-1", label: "Module 1 · Basic Derivatives", icon: Activity },
  { to: "/module-2", label: "Module 2 · Higher Order", icon: Boxes },
  { to: "/module-3", label: "Module 3 · Partial & Optimization", icon: Grid3x3 },
  { to: "/examples", label: "Examples", icon: BookOpen },
  { to: "/about", label: "About Project", icon: Info },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const stored = localStorage.getItem("efbp-theme");
    const isDark = stored ? stored === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("efbp-theme", next ? "dark" : "light");
  };
  return (
    <button
      onClick={toggle}
      aria-label="Toggle colour theme"
      className="rounded-md border border-border p-2 text-muted-foreground transition hover:text-foreground"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-blueprint opacity-[0.35]" aria-hidden />
      <div className="relative flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 shrink-0 border-r border-border bg-sidebar/95 backdrop-blur transition-transform lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-5">
            <Link to="/" className="block" onClick={() => setOpen(false)}>
              <div className="font-mono text-xs uppercase tracking-[0.24em] text-primary">EFBP</div>
              <div className="mt-1 text-sm font-semibold leading-tight text-sidebar-foreground">
                Derivative Behaviour Lab
              </div>
            </Link>
            <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="size-5" />
            </button>
          </div>
          <nav className="space-y-1 px-3 pb-8">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: to === "/" }}
                activeProps={{ className: "bg-primary/15 text-primary border-primary/40" }}
                inactiveProps={{ className: "text-muted-foreground border-transparent hover:bg-muted/50" }}
                className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition"
              >
                <Icon className="size-4 shrink-0" />
                <span className="leading-tight">{label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {open && (
          <div className="fixed inset-0 z-30 bg-background/70 lg:hidden" onClick={() => setOpen(false)} />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:px-8">
            <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="size-5" />
            </button>
            <p className="truncate font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Engineering Mathematics · Analysis Console
            </p>
            <ThemeToggle />
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8">{children}</main>
          <footer className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground lg:px-8">
            Engineering Function Behaviour Prediction Using Derivatives — built with math.js symbolic
            differentiation and Plotly visualisation.
          </footer>
        </div>
      </div>
    </div>
  );
}
