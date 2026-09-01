import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Plot } from "../components/plot/Plot";
import { Tex } from "../components/Tex";
import { Btn, Chip, Collapse, ErrorNote, Field, Panel, Stat, inputClass } from "../components/ui-kit";
import { analyzeTwoVariable, surfaceData } from "../lib/math-engine";
import { optimizationInterpretation } from "../lib/interpretation";

export const Route = createFileRoute("/module-3")({
  head: () => ({
    meta: [
      { title: "Module 3 · Partial Derivatives & Optimization | EFBP" },
      {
        name: "description",
        content:
          "Compute partial derivatives, gradients and Hessian determinants for two-variable engineering functions and classify maxima, minima and saddle points on a 3D surface.",
      },
      { property: "og:title", content: "Module 3 · Partial Derivatives & Engineering Optimization" },
      {
        property: "og:description",
        content: "Gradient, Hessian test and 3D surface visualisation for engineering cost optimization.",
      },
    ],
  }),
  component: Module3,
});

const examples = [
  "x^2 + y^2 - 4x - 6y",
  "x^2 + 2y^2 - 4x - 8y",
  "x^2 - y^2",
  "3x^2 + 2y^2 - 12x - 8y + 50",
];

function Module3() {
  const [expr, setExpr] = useState("x^2 + y^2 - 4x - 6y");
  const [range, setRange] = useState("8");
  const [submitted, setSubmitted] = useState({ expr: "x^2 + y^2 - 4x - 6y", r: 8 });

  const result = useMemo(() => {
    try {
      return {
        a: analyzeTwoVariable(submitted.expr, { from: -submitted.r, to: submitted.r }),
        error: null as string | null,
      };
    } catch (e) {
      return { a: null, error: (e as Error).message || "Invalid function." };
    }
  }, [submitted]);

  const a = result.a;
  const surf = a ? surfaceData(a.eval, a.domain) : null;

  const analyze = () => {
    const r = Number(range);
    setSubmitted({ expr: expr.trim() || "x^2 + y^2", r: Number.isFinite(r) && r > 0 ? r : 8 });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Module 3</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Partial Derivatives &amp; Engineering Optimization</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Two-variable analysis: partial derivatives, gradient, Hessian determinant classification and
          a rotatable 3D surface of the design space.
        </p>
      </header>

      <Panel title="Function Input · f(x, y)" className="no-print">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-3">
            <Field label="Function of two variables">
              <input
                className={inputClass}
                value={expr}
                onChange={(e) => setExpr(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyze()}
                placeholder="e.g. x^2 + y^2 - 4x - 6y"
              />
            </Field>
          </div>
          <Field label="Plot range ±">
            <input className={inputClass} value={range} onChange={(e) => setRange(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn onClick={analyze}>
            <Play className="size-4" /> Analyze &amp; Optimize
          </Btn>
          <Btn
            variant="ghost"
            onClick={() => {
              setExpr("x^2 + y^2 - 4x - 6y");
              setRange("8");
              setSubmitted({ expr: "x^2 + y^2 - 4x - 6y", r: 8 });
            }}
          >
            <RotateCcw className="size-4" /> Reset
          </Btn>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="self-center text-xs uppercase tracking-wider text-muted-foreground">Examples:</span>
          {examples.map((ex) => (
            <Chip
              key={ex}
              onClick={() => {
                setExpr(ex);
                setSubmitted({ expr: ex, r: Number(range) || 8 });
              }}
            >
              {ex}
            </Chip>
          ))}
        </div>
      </Panel>

      {result.error && <ErrorNote message={`${result.error} Use x and y, e.g. x^2 + 2y^2 - 4x - 8y.`} />}

      {a && (
        <>
          <Panel title="Partial Derivatives">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Stat label="f(x, y)" value={<Tex tex={a.tex.f} />} />
              <Stat label="∂f/∂x" value={<Tex tex={a.tex.fx} />} tone="accent" />
              <Stat label="∂f/∂y" value={<Tex tex={a.tex.fy} />} tone="accent" />
              <Stat label="∂²f/∂x²" value={<Tex tex={a.tex.fxx} />} />
              <Stat label="∂²f/∂y²" value={<Tex tex={a.tex.fyy} />} />
              <Stat label="∂²f/∂x∂y" value={<Tex tex={a.tex.fxy} />} />
              <Stat
                label="Gradient ∇f"
                value={<Tex tex={`\\nabla f = \\left( ${a.tex.fx},\\; ${a.tex.fy} \\right)`} />}
              />
            </div>
          </Panel>

          <Panel title="Critical Points &amp; Hessian Classification">
            {a.critical.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No stationary point found in the range ±{a.domain.to}. Try widening the plot range.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="py-2">Point (x, y)</th>
                      <th>f(x, y)</th>
                      <th>f<sub>xx</sub></th>
                      <th>f<sub>yy</sub></th>
                      <th>f<sub>xy</sub></th>
                      <th>D</th>
                      <th>Classification</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {a.critical.map((c) => (
                      <tr key={`${c.x}-${c.y}`} className="border-b border-border/60">
                        <td className="py-2">({c.x}, {c.y})</td>
                        <td>{c.z}</td>
                        <td>{c.fxx}</td>
                        <td>{c.fyy}</td>
                        <td>{c.fxy}</td>
                        <td>{c.D}</td>
                        <td
                          className={
                            c.type === "Local minimum"
                              ? "text-success"
                              : c.type === "Local maximum"
                                ? "text-destructive"
                                : "text-accent"
                          }
                        >
                          {c.type}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 rounded-md border border-border bg-muted/30 p-3">
              <Tex block tex={"D = f_{xx}f_{yy} - (f_{xy})^2"} />
            </div>
          </Panel>

          <Panel title="3D Surface Plot" subtitle="Drag to rotate, scroll to zoom, double-click to reset">
            <Plot
              height={520}
              data={[
                {
                  type: "surface",
                  x: surf!.x,
                  y: surf!.y,
                  z: surf!.z,
                  colorscale: "Viridis",
                  opacity: 0.92,
                  showscale: true,
                  contours: { z: { show: true, usecolormap: true, project: { z: true } } },
                },
                ...(a.critical.length
                  ? [
                      {
                        type: "scatter3d",
                        mode: "markers+text",
                        x: a.critical.map((c) => c.x),
                        y: a.critical.map((c) => c.y),
                        z: a.critical.map((c) => c.z),
                        text: a.critical.map((c) => c.type),
                        name: "Critical points",
                        marker: { size: 6, color: "#f87171" },
                      },
                    ]
                  : []),
              ]}
              layout={{
                scene: {
                  xaxis: { title: { text: "x" } },
                  yaxis: { title: { text: "y" } },
                  zaxis: { title: { text: "f(x, y)" } },
                },
                margin: { l: 0, r: 0, t: 10, b: 0 },
              }}
            />
          </Panel>

          <Panel title="Step-by-Step Calculation">
            <Collapse title="Show Step-by-Step Calculation" defaultOpen>
              <ol className="space-y-3">
                {a.steps.map((st) => (
                  <li key={st.title}>
                    <div className="text-sm font-semibold text-foreground">{st.title}</div>
                    <pre className="mt-1 whitespace-pre-wrap font-mono text-xs text-muted-foreground">{st.detail}</pre>
                  </li>
                ))}
              </ol>
            </Collapse>
          </Panel>

          <Panel title="Engineering Optimization Interpretation">
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              {a.critical.map((c) => (
                <li key={`i-${c.x}-${c.y}`} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{optimizationInterpretation(c)}</span>
                </li>
              ))}
              <li className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>
                  If f(x, y) is a cost function C(x, y) with x and y as design parameters (e.g. plate
                  thickness and beam width), the local minimum gives the optimal parameter pair and
                  the minimum achievable cost.
                </span>
              </li>
            </ul>
          </Panel>

          <CostExample />
        </>
      )}
    </div>
  );
}

function CostExample() {
  const c = useMemo(() => analyzeTwoVariable("3x^2 + 2y^2 - 12x - 8y + 50", { from: -2, to: 8 }), []);
  const top = c.critical[0];
  return (
    <Panel title="Worked Example · Material Cost Optimization" subtitle="C(x, y) = 3x² + 2y² − 12x − 8y + 50">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Cost function" value={<Tex tex={c.tex.f} />} />
        <Stat label="∂C/∂x" value={<Tex tex={c.tex.fx} />} />
        <Stat label="∂C/∂y" value={<Tex tex={c.tex.fy} />} />
        <Stat label="Critical point" value={top ? `(${top.x}, ${top.y})` : "—"} tone="accent" />
        <Stat label="Hessian D" value={top ? `${top.D} → ${top.type}` : "—"} />
        <Stat label="Minimum cost" value={top ? `${top.z} units` : "—"} tone="up" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Setting both partial derivatives to zero gives the optimal design parameters. Because the
        Hessian determinant is positive with C<sub>xx</sub> &gt; 0, this stationary point is a genuine
        minimum — the cheapest feasible design configuration.
      </p>
    </Panel>
  );
}
