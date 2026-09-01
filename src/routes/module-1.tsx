import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Printer, RotateCcw, Play } from "lucide-react";
import { Plot } from "../components/plot/Plot";
import { Tex } from "../components/Tex";
import { Btn, Chip, Collapse, ErrorNote, Field, Panel, Stat, inputClass } from "../components/ui-kit";
import { analyzeSingleVariable, sampleCurve, type Analysis1D } from "../lib/math-engine";
import { behaviourSummary, engineeringPrediction } from "../lib/interpretation";

export const Route = createFileRoute("/module-1")({
  head: () => ({
    meta: [
      { title: "Module 1 · Basic Derivative Analysis | EFBP" },
      {
        name: "description",
        content:
          "Enter any single-variable engineering function to compute its first derivative, critical points, increasing/decreasing intervals and local maxima and minima.",
      },
      { property: "og:title", content: "Module 1 · Basic Derivative Analysis" },
      {
        property: "og:description",
        content: "First derivative, slope, critical points, maxima and minima with interactive graphs.",
      },
    ],
  }),
  component: Module1,
});

const examples = ["x^2 - 4x + 3", "x^3 - 6x^2 + 9x", "sin(x)", "x^2 + 2x + 1", "x^3 - 4x", "x^2 - 6x + 5"];

function Module1() {
  const [expr, setExpr] = useState("x^2 - 4x + 3");
  const [variable, setVariable] = useState("x");
  const [from, setFrom] = useState("-6");
  const [to, setTo] = useState("6");
  const [showD1, setShowD1] = useState(true);
  const [submitted, setSubmitted] = useState<{ expr: string; variable: string; from: number; to: number } | null>({
    expr: "x^2 - 4x + 3",
    variable: "x",
    from: -6,
    to: 6,
  });

  const result = useMemo(() => {
    if (!submitted) return null;
    try {
      const a = analyzeSingleVariable(submitted.expr, submitted.variable, {
        from: submitted.from,
        to: submitted.to,
      });
      return { analysis: a, error: null as string | null };
    } catch (e) {
      return { analysis: null, error: (e as Error).message || "Invalid function." };
    }
  }, [submitted]);

  const analyze = () => {
    const a = Number(from);
    const b = Number(to);
    if (!expr.trim()) return setSubmitted(null);
    if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) {
      setSubmitted({ expr, variable, from: -10, to: 10 });
      return;
    }
    setSubmitted({ expr: expr.trim(), variable: variable.trim() || "x", from: a, to: b });
  };

  const clear = () => {
    setExpr("");
    setSubmitted(null);
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Module 1</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Basic Derivative Analysis</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          First derivative, slope, increasing / decreasing behaviour, critical points and local
          maxima & minima — computed symbolically from whatever function you type.
        </p>
      </header>

      <Panel title="Function Input" className="no-print">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <Field label="Function f(x)">
              <input
                className={inputClass}
                value={expr}
                onChange={(e) => setExpr(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyze()}
                placeholder="e.g. x^3 - 6x^2 + 9x"
              />
            </Field>
          </div>
          <Field label="Variable">
            <input className={inputClass} value={variable} onChange={(e) => setVariable(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Domain from">
              <input className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="to">
              <input className={inputClass} value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Btn onClick={analyze}>
            <Play className="size-4" /> Analyze Function
          </Btn>
          <Btn variant="ghost" onClick={clear}>
            <RotateCcw className="size-4" /> Clear
          </Btn>
          <Btn variant="ghost" onClick={() => typeof window !== "undefined" && window.print()}>
            <Printer className="size-4" /> Print report
          </Btn>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="self-center text-xs uppercase tracking-wider text-muted-foreground">Load example:</span>
          {examples.map((ex) => (
            <Chip
              key={ex}
              onClick={() => {
                setExpr(ex);
                setSubmitted({ expr: ex, variable, from: Number(from) || -6, to: Number(to) || 6 });
              }}
            >
              {ex}
            </Chip>
          ))}
        </div>
      </Panel>

      {result?.error && <ErrorNote message={`${result.error} Please check the syntax, e.g. x^2 - 4x + 3.`} />}

      {result?.analysis && (
        <AnalysisView analysis={result.analysis} showD1={showD1} setShowD1={setShowD1} />
      )}

      <VehicleExample />
    </div>
  );
}

function AnalysisView({
  analysis: a,
  showD1,
  setShowD1,
}: {
  analysis: Analysis1D;
  showD1: boolean;
  setShowD1: (v: boolean) => void;
}) {
  const s = behaviourSummary(a);
  const curve = sampleCurve(a.eval, a.domain);
  const dcurve = sampleCurve(a.evalD1, a.domain);
  const maxima = a.critical.filter((c) => c.type === "maximum");
  const minima = a.critical.filter((c) => c.type === "minimum");

  const data: unknown[] = [
    { x: curve.x, y: curve.y, type: "scatter", mode: "lines", name: `f(${a.variable})`, line: { width: 3, color: "#38bdf8" } },
  ];
  if (showD1)
    data.push({
      x: dcurve.x,
      y: dcurve.y,
      type: "scatter",
      mode: "lines",
      name: `f'(${a.variable})`,
      line: { width: 2, dash: "dot", color: "#fbbf24" },
    });
  if (maxima.length)
    data.push({
      x: maxima.map((c) => c.x),
      y: maxima.map((c) => c.y),
      type: "scatter",
      mode: "markers+text",
      name: "Local maximum",
      text: maxima.map((c) => `max (${c.x}, ${c.y})`),
      textposition: "top center",
      marker: { size: 11, color: "#f87171", symbol: "triangle-up" },
    });
  if (minima.length)
    data.push({
      x: minima.map((c) => c.x),
      y: minima.map((c) => c.y),
      type: "scatter",
      mode: "markers+text",
      name: "Local minimum",
      text: minima.map((c) => `min (${c.x}, ${c.y})`),
      textposition: "bottom center",
      marker: { size: 11, color: "#34d399", symbol: "triangle-down" },
    });

  return (
    <>
      <Panel title="Analysis Result" subtitle="Computed live with symbolic differentiation">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Function" value={<Tex tex={`f(${a.variable}) = ${a.tex.f}`} />} />
          <Stat label="First derivative" value={<Tex tex={`f'(${a.variable}) = ${a.tex.d1}`} />} tone="accent" />
          <Stat label="Second derivative" value={<Tex tex={`f''(${a.variable}) = ${a.tex.d2}`} />} />
          <Stat
            label="Critical points"
            value={a.critical.length ? a.critical.map((c) => `(${c.x}, ${c.y})`).join("  ") : "none in domain"}
          />
          <Stat label="Local maximum" value={maxima.length ? maxima.map((c) => `(${c.x}, ${c.y})`).join("  ") : "—"} tone="down" />
          <Stat label="Local minimum" value={minima.length ? minima.map((c) => `(${c.x}, ${c.y})`).join("  ") : "—"} tone="up" />
          <Stat label="Increasing on" value={s.increasing} tone="up" />
          <Stat label="Decreasing on" value={s.decreasing} tone="down" />
          <Stat label="Behaviour" value={s.trend} tone="accent" />
        </div>
      </Panel>

      <Panel
        title="Interactive Graph"
        subtitle="Zoom, pan, hover for values — use the modebar to reset axes"
        actions={
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={showD1} onChange={(e) => setShowD1(e.target.checked)} />
            Show f&apos;({a.variable})
          </label>
        }
      >
        <Plot data={data} height={440} />
      </Panel>

      <Panel title="Step-by-Step Calculation">
        <Collapse title="Show Step-by-Step Calculation" defaultOpen>
          <ol className="space-y-3">
            {a.steps.slice(0, 5).map((st) => (
              <li key={st.title}>
                <div className="text-sm font-semibold text-foreground">{st.title}</div>
                <pre className="mt-1 whitespace-pre-wrap font-mono text-xs text-muted-foreground">{st.detail}</pre>
              </li>
            ))}
          </ol>
          <div className="mt-4 rounded-md border border-border bg-muted/30 p-3">
            <Tex block tex={`f(${a.variable}) = ${a.tex.f} \\;\\Longrightarrow\\; f'(${a.variable}) = ${a.tex.d1} = 0`} />
          </div>
        </Collapse>
      </Panel>

      <Panel title="Engineering Behaviour Prediction">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          {engineeringPrediction(a).map((line, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

function VehicleExample() {
  const a = useMemo(() => analyzeSingleVariable("t^3 - 6t^2 + 9t", "t", { from: 0, to: 5 }), []);
  const pos = sampleCurve(a.eval, a.domain);
  const vel = sampleCurve(a.evalD1, a.domain);
  return (
    <Panel title="Worked Example · Vehicle Position Analysis" subtitle="s(t) = t³ − 6t² + 9t">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Stat label="Position" value={<Tex tex={`s(t) = ${a.tex.f}`} />} />
          <Stat label="Velocity v(t) = ds/dt" value={<Tex tex={`v(t) = ${a.tex.d1}`} />} tone="accent" />
          <Stat
            label="Critical time points (v = 0)"
            value={a.critical.map((c) => `t = ${c.x} s`).join(", ") || "none"}
          />
          <Stat label="Moving forward (s increasing)" value={behaviourSummary(a).increasing} tone="up" />
          <Stat label="Moving backward (s decreasing)" value={behaviourSummary(a).decreasing} tone="down" />
          <p className="text-sm text-muted-foreground">
            The vehicle stops instantaneously where velocity is zero, reverses while the velocity is
            negative, then moves forward again — exactly the turning points the derivative predicts.
          </p>
        </div>
        <Plot
          height={340}
          data={[
            { x: pos.x, y: pos.y, type: "scatter", mode: "lines", name: "Position s(t)", line: { color: "#38bdf8", width: 3 } },
            { x: vel.x, y: vel.y, type: "scatter", mode: "lines", name: "Velocity v(t)", line: { color: "#fbbf24", width: 2, dash: "dot" } },
            {
              x: a.critical.map((c) => c.x),
              y: a.critical.map((c) => c.y),
              type: "scatter",
              mode: "markers",
              name: "Critical times",
              marker: { size: 10, color: "#f87171" },
            },
          ]}
          layout={{ xaxis: { title: { text: "t (s)" } } }}
        />
      </div>
    </Panel>
  );
}
