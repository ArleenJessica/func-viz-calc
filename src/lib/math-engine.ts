import { derivative, parse, simplify, type MathNode } from "mathjs";

export type Interval = { from: number; to: number };

export type CriticalPoint = {
  x: number;
  y: number;
  type: "maximum" | "minimum" | "saddle/inflection";
  second: number;
};

export type Analysis1D = {
  expr: string;
  variable: string;
  tex: { f: string; d1: string; d2: string; d3: string };
  pretty: { f: string; d1: string; d2: string; d3: string };
  critical: CriticalPoint[];
  inflections: { x: number; y: number }[];
  increasing: Interval[];
  decreasing: Interval[];
  concaveUp: Interval[];
  concaveDown: Interval[];
  domain: Interval;
  eval: (x: number) => number;
  evalD1: (x: number) => number;
  evalD2: (x: number) => number;
  evalD3: (x: number) => number;
  steps: { title: string; detail: string }[];
};

const cleanup = (s: string) => s.replace(/\s+/g, " ").trim();

function tex(node: MathNode) {
  try {
    return simplify(node).toTex({ parenthesis: "auto" });
  } catch {
    return node.toTex({ parenthesis: "auto" });
  }
}

function pretty(node: MathNode) {
  try {
    return cleanup(simplify(node).toString());
  } catch {
    return cleanup(node.toString());
  }
}

function compile1(node: MathNode, variable: string) {
  const c = node.compile();
  return (x: number) => {
    try {
      const v = c.evaluate({ [variable]: x });
      return typeof v === "number" && Number.isFinite(v) ? v : NaN;
    } catch {
      return NaN;
    }
  };
}

/** Bisection root refinement of a continuous sampled function. */
function refine(f: (x: number) => number, a: number, b: number) {
  let lo = a;
  let hi = b;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (!Number.isFinite(fm)) return mid;
    if (f(lo) * fm <= 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

export function findRoots(f: (x: number) => number, from: number, to: number, samples = 4000) {
  const roots: number[] = [];
  const step = (to - from) / samples;
  let prevX = from;
  let prevY = f(from);
  for (let i = 1; i <= samples; i++) {
    const x = from + i * step;
    const y = f(x);
    if (Number.isFinite(prevY) && Number.isFinite(y)) {
      if (prevY === 0) roots.push(prevX);
      else if (prevY * y < 0) roots.push(refine(f, prevX, x));
      else if (Math.abs(y) < 1e-12) roots.push(x);
    }
    prevX = x;
    prevY = y;
  }
  const out: number[] = [];
  for (const r of roots) {
    const rr = Math.abs(r) < 1e-9 ? 0 : r;
    if (!out.some((o) => Math.abs(o - rr) < (to - from) / samples + 1e-6)) out.push(rr);
  }
  return out;
}

function signIntervals(
  f: (x: number) => number,
  from: number,
  to: number,
  breakpoints: number[],
): { positive: Interval[]; negative: Interval[] } {
  const pts = [from, ...breakpoints.filter((b) => b > from && b < to).sort((a, b) => a - b), to];
  const positive: Interval[] = [];
  const negative: Interval[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (b - a < 1e-9) continue;
    const v = f((a + b) / 2);
    if (!Number.isFinite(v) || v === 0) continue;
    (v > 0 ? positive : negative).push({ from: a, to: b });
  }
  return { positive, negative };
}

export const round = (n: number, digits = 4) => {
  const r = Number(n.toFixed(digits));
  return Object.is(r, -0) ? 0 : r;
};

export function analyzeSingleVariable(
  expr: string,
  variable: string,
  domain: Interval,
): Analysis1D {
  const node = parse(expr);
  const d1 = derivative(node, variable);
  const d2 = derivative(d1, variable);
  const d3 = derivative(d2, variable);

  const f = compile1(node, variable);
  const f1 = compile1(d1, variable);
  const f2 = compile1(d2, variable);
  const f3 = compile1(d3, variable);

  // Validate
  const probe = f((domain.from + domain.to) / 2);
  if (Number.isNaN(probe) && Number.isNaN(f(domain.from)) && Number.isNaN(f(domain.to))) {
    throw new Error(`Could not evaluate the function over the chosen domain.`);
  }

  const critX = findRoots(f1, domain.from, domain.to);
  const critical: CriticalPoint[] = critX.map((x) => {
    const s = f2(x);
    const type: CriticalPoint["type"] =
      s > 1e-6 ? "minimum" : s < -1e-6 ? "maximum" : "saddle/inflection";
    return { x: round(x), y: round(f(x)), second: round(s), type };
  });

  const inflX = findRoots(f2, domain.from, domain.to);
  const inflections = inflX
    .filter((x) => Math.abs(f3(x)) > 1e-6 || true)
    .map((x) => ({ x: round(x), y: round(f(x)) }));

  const mono = signIntervals(f1, domain.from, domain.to, critX);
  const conc = signIntervals(f2, domain.from, domain.to, inflX);

  const steps = [
    { title: "1. Given function", detail: `f(${variable}) = ${pretty(node)}` },
    {
      title: "2. Differentiate",
      detail: `f'(${variable}) = ${pretty(d1)} (power / chain / product rules applied symbolically)`,
    },
    {
      title: "3. Solve f'(x) = 0",
      detail: critX.length
        ? `Critical ${variable}-values: ${critX.map((x) => round(x)).join(", ")}`
        : `No stationary points inside [${domain.from}, ${domain.to}].`,
    },
    { title: "4. Second derivative", detail: `f''(${variable}) = ${pretty(d2)}` },
    {
      title: "5. Second derivative test",
      detail: critical.length
        ? critical
            .map(
              (c) =>
                `At ${variable} = ${c.x}: f'' = ${c.second} → ${
                  c.type === "minimum"
                    ? "local minimum"
                    : c.type === "maximum"
                      ? "local maximum"
                      : "test inconclusive (possible inflection)"
                }, f = ${c.y}`,
            )
            .join("\n")
        : "No critical points to classify.",
    },
    {
      title: "6. Inflection points (f'' = 0)",
      detail: inflections.length
        ? inflections.map((p) => `(${p.x}, ${p.y})`).join(", ")
        : "None inside the domain.",
    },
  ];

  return {
    expr,
    variable,
    tex: { f: tex(node), d1: tex(d1), d2: tex(d2), d3: tex(d3) },
    pretty: { f: pretty(node), d1: pretty(d1), d2: pretty(d2), d3: pretty(d3) },
    critical,
    inflections,
    increasing: mono.positive,
    decreasing: mono.negative,
    concaveUp: conc.positive,
    concaveDown: conc.negative,
    domain,
    eval: f,
    evalD1: f1,
    evalD2: f2,
    evalD3: f3,
    steps,
  };
}

export function sampleCurve(
  f: (x: number) => number,
  domain: Interval,
  points = 600,
): { x: number[]; y: number[] } {
  const x: number[] = [];
  const y: number[] = [];
  const step = (domain.to - domain.from) / points;
  for (let i = 0; i <= points; i++) {
    const xi = domain.from + i * step;
    x.push(xi);
    y.push(f(xi));
  }
  return { x, y };
}

/* ---------------------------- Two variables ---------------------------- */

export type Critical2D = {
  x: number;
  y: number;
  z: number;
  fxx: number;
  fyy: number;
  fxy: number;
  D: number;
  type: "Local minimum" | "Local maximum" | "Saddle point" | "Inconclusive";
};

export type Analysis2D = {
  expr: string;
  tex: { f: string; fx: string; fy: string; fxx: string; fyy: string; fxy: string };
  pretty: { f: string; fx: string; fy: string; fxx: string; fyy: string; fxy: string };
  critical: Critical2D[];
  eval: (x: number, y: number) => number;
  steps: { title: string; detail: string }[];
  domain: { from: number; to: number };
};

function compile2(node: MathNode) {
  const c = node.compile();
  return (x: number, y: number) => {
    try {
      const v = c.evaluate({ x, y });
      return typeof v === "number" && Number.isFinite(v) ? v : NaN;
    } catch {
      return NaN;
    }
  };
}

export function analyzeTwoVariable(
  expr: string,
  domain: { from: number; to: number } = { from: -10, to: 10 },
): Analysis2D {
  const node = parse(expr);
  const fxN = derivative(node, "x");
  const fyN = derivative(node, "y");
  const fxxN = derivative(fxN, "x");
  const fyyN = derivative(fyN, "y");
  const fxyN = derivative(fxN, "y");

  const f = compile2(node);
  const fx = compile2(fxN);
  const fy = compile2(fyN);
  const fxx = compile2(fxxN);
  const fyy = compile2(fyyN);
  const fxy = compile2(fxyN);

  if (Number.isNaN(f(1, 1)) && Number.isNaN(f(0.5, 0.5))) {
    throw new Error("Could not evaluate f(x, y). Use x and y as the variables.");
  }

  // Newton's method from a grid of starting guesses
  const found: Critical2D[] = [];
  const g = 12;
  const stepG = (domain.to - domain.from) / g;
  for (let i = 0; i <= g; i++) {
    for (let j = 0; j <= g; j++) {
      let px = domain.from + i * stepG;
      let py = domain.from + j * stepG;
      let ok = false;
      for (let k = 0; k < 60; k++) {
        const a = fxx(px, py);
        const b = fxy(px, py);
        const d = fyy(px, py);
        const det = a * d - b * b;
        const gx = fx(px, py);
        const gy = fy(px, py);
        if (![a, b, d, gx, gy].every(Number.isFinite)) break;
        if (Math.abs(gx) < 1e-10 && Math.abs(gy) < 1e-10) {
          ok = true;
          break;
        }
        if (Math.abs(det) < 1e-12) break;
        px -= (d * gx - b * gy) / det;
        py -= (-b * gx + a * gy) / det;
        if (!Number.isFinite(px) || !Number.isFinite(py)) break;
      }
      if (!ok) continue;
      if (px < domain.from - 1 || px > domain.to + 1 || py < domain.from - 1 || py > domain.to + 1)
        continue;
      const rx = round(px, 6);
      const ry = round(py, 6);
      if (found.some((c) => Math.abs(c.x - rx) < 1e-4 && Math.abs(c.y - ry) < 1e-4)) continue;
      const a = fxx(rx, ry);
      const d = fyy(rx, ry);
      const b = fxy(rx, ry);
      const D = a * d - b * b;
      const type: Critical2D["type"] =
        D > 1e-9 ? (a > 0 ? "Local minimum" : "Local maximum") : D < -1e-9 ? "Saddle point" : "Inconclusive";
      found.push({
        x: round(rx),
        y: round(ry),
        z: round(f(rx, ry)),
        fxx: round(a),
        fyy: round(d),
        fxy: round(b),
        D: round(D),
        type,
      });
    }
  }

  const steps = [
    { title: "1. Given function", detail: `f(x, y) = ${pretty(node)}` },
    { title: "2. Partial derivatives", detail: `∂f/∂x = ${pretty(fxN)}\n∂f/∂y = ${pretty(fyN)}` },
    { title: "3. Solve ∂f/∂x = 0 and ∂f/∂y = 0", detail: found.length ? found.map((c) => `(${c.x}, ${c.y})`).join(", ") : "No stationary point found in range." },
    {
      title: "4. Second order partials",
      detail: `fxx = ${pretty(fxxN)}\nfyy = ${pretty(fyyN)}\nfxy = ${pretty(fxyN)}`,
    },
    {
      title: "5. Hessian test  D = fxx·fyy − (fxy)²",
      detail: found.length
        ? found
            .map(
              (c) =>
                `At (${c.x}, ${c.y}): D = ${c.fxx}·${c.fyy} − (${c.fxy})² = ${c.D} → ${c.type}${
                  c.type === "Local minimum" || c.type === "Local maximum" ? `, f = ${c.z}` : ""
                }`,
            )
            .join("\n")
        : "Nothing to classify.",
    },
  ];

  return {
    expr,
    tex: {
      f: tex(node),
      fx: tex(fxN),
      fy: tex(fyN),
      fxx: tex(fxxN),
      fyy: tex(fyyN),
      fxy: tex(fxyN),
    },
    pretty: {
      f: pretty(node),
      fx: pretty(fxN),
      fy: pretty(fyN),
      fxx: pretty(fxxN),
      fyy: pretty(fyyN),
      fxy: pretty(fxyN),
    },
    critical: found,
    eval: f,
    steps,
    domain,
  };
}

export function surfaceData(
  f: (x: number, y: number) => number,
  domain: { from: number; to: number },
  n = 60,
) {
  const xs: number[] = [];
  const ys: number[] = [];
  const step = (domain.to - domain.from) / n;
  for (let i = 0; i <= n; i++) {
    xs.push(domain.from + i * step);
    ys.push(domain.from + i * step);
  }
  const z = ys.map((y) => xs.map((x) => f(x, y)));
  return { x: xs, y: ys, z };
}

export function formatInterval(i: Interval) {
  return `(${round(i.from, 3)}, ${round(i.to, 3)})`;
}
