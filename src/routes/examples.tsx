import { createFileRoute, Link } from "@tanstack/react-router";
import { Panel } from "../components/ui-kit";
import { Tex } from "../components/Tex";

export const Route = createFileRoute("/examples")({
  head: () => ({
    meta: [
      { title: "Example Function Library | EFBP" },
      {
        name: "description",
        content:
          "Ready-made engineering functions for derivative analysis: polynomial curves, motion functions and two-variable cost optimization models.",
      },
      { property: "og:title", content: "Example Function Library" },
      {
        property: "og:description",
        content: "Curated example functions for each derivative analysis module.",
      },
    ],
  }),
  component: Examples,
});

const groups = [
  {
    title: "Module 1 · Basic derivative analysis",
    to: "/module-1" as const,
    items: [
      { tex: "f(x) = x^2 - 4x + 3", note: "Single minimum — stable operating point." },
      { tex: "f(x) = x^3 - 6x^2 + 9x", note: "One maximum and one minimum — load reversal." },
      { tex: "f(x) = \\sin(x)", note: "Periodic peaks and troughs — oscillating signal." },
    ],
  },
  {
    title: "Module 2 · Higher order derivatives",
    to: "/module-2" as const,
    items: [
      { tex: "s(t) = t^3 - 6t^2 + 9t", note: "Position → velocity → acceleration cascade." },
      { tex: "f(x) = x^4 - 4x^3", note: "Two inflection points, changing concavity." },
      { tex: "f(x) = e^{-x}\\sin(x)", note: "Damped oscillation — vibration decay." },
    ],
  },
  {
    title: "Module 3 · Partial derivatives & optimization",
    to: "/module-3" as const,
    items: [
      { tex: "f(x,y) = x^2 + y^2 - 4x - 6y", note: "Bowl surface — unique minimum at (2, 3)." },
      { tex: "f(x,y) = x^2 + 2y^2 - 4x - 8y", note: "Elliptic paraboloid minimum." },
      { tex: "C(x,y) = 3x^2 + 2y^2 - 12x - 8y + 50", note: "Engineering cost minimisation." },
      { tex: "f(x,y) = x^2 - y^2", note: "Saddle point at the origin." },
    ],
  },
];

function Examples() {
  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Library</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Example Functions</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Copy any function into the matching module, or open the module and click its example chips
          to load it instantly.
        </p>
      </header>
      {groups.map((g) => (
        <Panel key={g.title} title={g.title}>
          <ul className="space-y-3">
            {g.items.map((it) => (
              <li key={it.tex} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-4 py-3">
                <Tex tex={it.tex} />
                <span className="text-xs text-muted-foreground">{it.note}</span>
              </li>
            ))}
          </ul>
          <Link
            to={g.to}
            className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110"
          >
            Open module
          </Link>
        </Panel>
      ))}
    </div>
  );
}
