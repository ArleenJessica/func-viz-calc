import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, Boxes, Grid3x3 } from "lucide-react";
import { Panel } from "../components/ui-kit";
import { Tex } from "../components/Tex";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Engineering Function Behaviour Prediction Using Derivatives" },
      {
        name: "description",
        content:
          "Interactive engineering mathematics tool: analyse any function with first, higher-order and partial derivatives to predict behaviour, find optima and visualise results.",
      },
      { property: "og:title", content: "Engineering Function Behaviour Prediction Using Derivatives" },
      {
        property: "og:description",
        content:
          "An interactive engineering mathematics analysis and optimization system built on symbolic derivatives.",
      },
    ],
  }),
  component: Index,
});

const modules = [
  {
    n: "01",
    to: "/module-1" as const,
    icon: Activity,
    title: "Basic Derivative Analysis",
    points: ["First derivative", "Slope", "Increasing / decreasing behaviour", "Critical points", "Maxima and minima"],
  },
  {
    n: "02",
    to: "/module-2" as const,
    icon: Boxes,
    title: "Higher Order Derivatives",
    points: ["Second derivative", "Third and higher derivatives", "Concavity", "Inflection points", "Position, velocity, acceleration"],
  },
  {
    n: "03",
    to: "/module-3" as const,
    icon: Grid3x3,
    title: "Partial Derivatives & Engineering Optimization",
    points: ["Partial derivatives", "Gradient", "Critical points of multivariable functions", "Maxima / minima / saddle", "Engineering optimization"],
  },
];

function Index() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-card/70 p-8 shadow-panel backdrop-blur lg:p-12">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
          Engineering Mathematics · Derivative Lab
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          Engineering Function Behaviour Prediction Using Derivatives
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          An Interactive Engineering Mathematics Analysis and Optimization System
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/module-1"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition hover:brightness-110"
          >
            Start Analysis <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/examples"
            className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium transition hover:bg-muted/60"
          >
            Browse examples
          </Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            "f'(x) = \\text{rate of change}",
            "f''(x) = \\text{concavity}",
            "D = f_{xx}f_{yy} - (f_{xy})^2",
          ].map((t) => (
            <div key={t} className="rounded-lg border border-border bg-background/40 px-4 py-3 text-center">
              <Tex tex={t} />
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {modules.map((m) => (
          <article
            key={m.n}
            className="flex flex-col rounded-xl border border-border bg-card/80 p-6 shadow-panel backdrop-blur transition hover:border-primary/50"
          >
            <div className="flex items-center justify-between">
              <m.icon className="size-6 text-primary" />
              <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground">MODULE {m.n}</span>
            </div>
            <h2 className="mt-4 text-lg font-semibold leading-snug">{m.title}</h2>
            <ul className="mt-3 flex-1 space-y-1.5 text-sm text-muted-foreground">
              {m.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                  {p}
                </li>
              ))}
            </ul>
            <Link
              to={m.to}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110"
            >
              Start Analysis <ArrowRight className="size-4" />
            </Link>
          </article>
        ))}
      </div>

      <Panel title="How it works" subtitle="Every result is computed live — nothing is hard-coded">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Enter a function", "Type any expression such as x^3 - 6x^2 + 9x or x^2 + y^2 - 4x - 6y."],
            ["Differentiate", "The expression is differentiated symbolically to first, second and third order."],
            ["Locate key points", "Critical points, inflection points and optima are found numerically."],
            ["Predict behaviour", "Results are translated into an engineering interpretation and plotted."],
          ].map(([t, d], i) => (
            <div key={t} className="rounded-lg border border-border bg-background/40 p-4">
              <div className="font-mono text-xs text-primary">STEP {i + 1}</div>
              <div className="mt-1 text-sm font-semibold">{t}</div>
              <p className="mt-1 text-xs text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
