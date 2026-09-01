import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Plot } from "../components/plot/Plot";
import { Tex } from "../components/Tex";
import { Btn, Chip, Collapse, ErrorNote, Field, Panel, Stat, inputClass } from "../components/ui-kit";
import { analyzeSingleVariable, sampleCurve } from "../lib/math-engine";
import { behaviourSummary } from "../lib/interpretation";

export const Route = createFileRoute("/module-2")({
  head: () => ({
    meta: [
      { title: "Module 2 · Higher Order Derivatives | EFBP" },
      {
        name: "description",
        content:
          "Compute second, third and higher order derivatives, concavity, inflection points and position–velocity–acceleration motion analysis interactively.",
      },
      { property: "og:title", content: "Module 2 · Higher Order Derivatives" },
      {
        property: "og:description",
        content: "Concavity, inflection points and motion analysis driven by higher order derivatives.",
      },
    ],
  }),
  component: Module2,
});

const examples = ["t^3 - 6t^2 + 9t", "x^4 - 4x^3", "sin(x)", "x^3 - 3x^2 + 2", "exp(-x)*sin(x)"];

function Module2() {
  const [expr, setExpr] = useState("t^3 - 6t^2 + 9t");
  const [variable, setVariable] = useState("t");
  const [from, setFrom] = useState("-1");
  const [to, setTo] = useState("6");
  const [show, setShow] = useState({ f: true, d1: true, d2: true, d3: false });
  const [submitted, setSubmitted] = useState({ expr: "t^3 - 6t^2 + 9t", variable: "t", from: -1, to: 6 });

  const result = useMemo(() => {
    try {
      return {
        a: analyzeSingleVariable(submitted.expr, submitted.variable, {
          from: submitted.from,
          to: submitted.to,
        }),
        error: null as string | null,
      };
    } catch (e) {
      return { a: null, error: (e as Error).message || "Invalid function." };
    }
  }, [submitted]);

  const analyze = () => {
    const f = Number(from);
    const t = Number(to);
    setSubmitted({
      expr: expr.trim() || "x",
      variable: variable.trim() || "x",
      from: Number.isFinite(f) ? f : -10,
      to: Number.isFinite(t) && t > f ? t : (Number.isFinite(f) ? f : -10) + 20,
    });
  };

  const a = result.a;
  const curves = a
    ? {
        f: sampleCurve(a.eval, a.domain),
        d1: sampleCurve(a.evalD1, a.domain),
        d2: sampleCurve(a.evalD2, a.domain),
        d3: sampleCurve(a.evalD3, a.domain),
      }
    : null;

  const data: unknown[] = [];
  if (a && curves) {
    if (show.f) data.push({ x: curves.f.x, y: curves.f.y, type: "scatter", mode: "lines", name: "Position f", line: { color: "#38bdf8", width: 3 } });
    if (show.d1) data.push({ x: curves.d1.x, y: curves.d1.y, type: "scatter", mode: "lines", name: "Velocity f′", line: { color: "#fbbf24", width: 2 } });
    if (show.d2) data.push({ x: curves.d2.x, y: curves.d2.y, type: "scatter", mode: "lines", name: "Acceleration f″", line: { color: "#34d399", width: 2, dash: "dash" } });
    if (show.d3) data.push({ x: curves.d3.x, y: curves.d3.y, type: "scatter", mode: "lines", name: "Jerk f‴", line: { color: "#c084fc", width: 2, dash: "dot" } });
    if (a.inflections.length)
      data.push({
        x: a.inflections.map((p) => p.x),
        y: a.inflections.map((p) => p.y),
        type: "scatter",
        mode: "markers+text",
        name: "Inflection point",
        text: a.inflections.map((p) => `inflection (${p.x}, ${p.y})`),
        textposition: "top center",
        marker: { size: 11, color: "#f87171", symbol: "diamond" },
      });
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Module 2</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Higher Order Derivatives</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Second, third and higher order derivatives with concavity, inflection points and full
          position → velocity → acceleration motion analysis.
        </p>
      </header>

      <Panel title="Function Input" className="no-print">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <Field label="Function f(t)">
              <input
                className={inputClass}
                value={expr}
                onChange={(e) => setExpr(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyze()}
              />
            </Field>
          </div>
          <Field label="Variable">
            <input className={inputClass} value={variable} onChange={(e) => setVariable(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="From">
              <input className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="To">
              <input className={inputClass} value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn onClick={analyze}>
            <Play className="size-4" /> Analyze
          </Btn>
          <Btn
            variant="ghost"
            onClick={() => {
              setExpr("t^3 - 6t^2 + 9t");
              setVariable("t");
              setFrom("-1");
              setTo("6");
              setSubmitted({ expr: "t^3 - 6t^2 + 9t", variable: "t", from: -1, to: 6 });
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
                setSubmitted({ ...submitted, expr: ex, variable: ex.includes("t") ? "t" : "x" });
                setVariable(ex.includes("t") ? "t" : "x");
              }}
            >
              {ex}
            </Chip>
          ))}
        </div>
      </Panel>

      {result.error && <ErrorNote message={`${result.error} Try a syntax like t^3 - 6t^2 + 9t.`} />}

      {a && (
        <>
          <Panel title="Derivative Cascade">
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="f" value={<Tex tex={`f(${a.variable}) = ${a.tex.f}`} />} />
              <Stat label="First derivative → velocity" value={<Tex tex={`f'(${a.variable}) = ${a.tex.d1}`} />} tone="accent" />
              <Stat label="Second derivative → acceleration" value={<Tex tex={`f''(${a.variable}) = ${a.tex.d2}`} />} tone="up" />
              <Stat label="Third derivative → jerk" value={<Tex tex={`f'''(${a.variable}) = ${a.tex.d3}`} />} />
              <Stat label="Critical points" value={a.critical.length ? a.critical.map((c) => `(${c.x}, ${c.y}) ${c.type}`).join("  |  ") : "none"} />
              <Stat label="Inflection points" value={a.inflections.length ? a.inflections.map((p) => `(${p.x}, ${p.y})`).join("  ") : "none"} tone="accent" />
              <Stat label="Concave upward on" value={behaviourSummary(a).concaveUp} tone="up" />
              <Stat label="Concave downward on" value={behaviourSummary(a).concaveDown} tone="down" />
            </div>
          </Panel>

          <Panel
            title="Motion Graph"
            subtitle="Toggle curves — position, velocity, acceleration and jerk"
            actions={
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {(
                  [
                    ["f", "Position"],
                    ["d1", "Velocity"],
                    ["d2", "Acceleration"],
                    ["d3", "Jerk"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={show[key]}
                      onChange={(e) => setShow({ ...show, [key]: e.target.checked })}
                    />
                    {label}
                  </label>
                ))}
              </div>
            }
          >
            <Plot data={data} height={440} layout={{ xaxis: { title: { text: a.variable } } }} />
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

          <Panel title="Engineering Interpretation">
            <p className="text-sm leading-relaxed text-muted-foreground">
              The second derivative helps predict how rapidly the rate of change itself is changing.
              In motion analysis it represents acceleration: where f″ &gt; 0 the curve is concave
              upward and the quantity is speeding up; where f″ &lt; 0 it is concave downward and
              slowing down. Inflection points{" "}
              {a.inflections.length ? `at ${a.inflections.map((p) => p.x).join(", ")}` : "(none here)"}{" "}
              mark the instants where the acceleration changes sign — for a machine or vehicle this
              is where the load reverses direction, an important design and fatigue consideration.
              The third derivative (jerk) measures ride comfort and mechanical shock.
            </p>
          </Panel>
        </>
      )}
    </div>
  );
}
