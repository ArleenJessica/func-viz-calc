import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "../components/ui-kit";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Project | EFBP" },
      {
        name: "description",
        content:
          "About Engineering Function Behaviour Prediction Using Derivatives — scope, methodology and technology behind the interactive analysis system.",
      },
      { property: "og:title", content: "About the Project" },
      {
        property: "og:description",
        content: "Scope, methodology and technology of the derivative behaviour prediction system.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">About</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Engineering Function Behaviour Prediction Using Derivatives
        </h1>
      </header>

      <Panel title="Objective">
        <p className="text-sm leading-relaxed text-muted-foreground">
          This project demonstrates how differential calculus predicts the behaviour of engineering
          quantities. Any function the user types is differentiated symbolically, its critical
          points are located numerically, and the results are translated into plain engineering
          language — rising or falling behaviour, peak loads, stable operating points, acceleration
          and optimal design parameters.
        </p>
      </Panel>

      <Panel title="Methodology">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Symbolic differentiation of the entered expression (first, second and third order).</li>
          <li>• Numerical root finding (sign change + bisection) to locate f′(x) = 0 and f″(x) = 0.</li>
          <li>• Second derivative test to classify maxima, minima and inflection points.</li>
          <li>• Newton iteration on the gradient plus the Hessian determinant D = f<sub>xx</sub>f<sub>yy</sub> − (f<sub>xy</sub>)² for two-variable optimization.</li>
          <li>• Interval sign analysis for increasing / decreasing and concavity regions.</li>
        </ul>
      </Panel>

      <Panel title="Technology">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["React + TypeScript", "Tailwind CSS", "math.js (symbolic)", "Plotly.js (2D & 3D)", "KaTeX notation", "TanStack Router", "Responsive layout", "Light & dark theme"].map((t) => (
            <div key={t} className="rounded-lg border border-border bg-background/40 px-4 py-3 font-mono text-xs">
              {t}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Academic Use">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Suitable as a first-year engineering mathematics demonstration: every result is computed
          at runtime from the user&apos;s input, with a step-by-step derivation and an engineering
          interpretation for each analysis. Use the print option on Module 1 to produce a report.
        </p>
      </Panel>
    </div>
  );
}
