import { formatInterval, type Analysis1D, type Critical2D } from "./math-engine";

export function behaviourSummary(a: Analysis1D) {
  const inc = a.increasing.reduce((s, i) => s + (i.to - i.from), 0);
  const dec = a.decreasing.reduce((s, i) => s + (i.to - i.from), 0);
  const trend =
    a.critical.length === 0
      ? inc > dec
        ? "Monotonically increasing over the domain"
        : "Monotonically decreasing over the domain"
      : `Changing trend — ${a.critical.length} turning point${a.critical.length > 1 ? "s" : ""} detected`;

  const maxima = a.critical.filter((c) => c.type === "maximum");
  const minima = a.critical.filter((c) => c.type === "minimum");

  return {
    trend,
    increasing: a.increasing.map(formatInterval).join(", ") || "none",
    decreasing: a.decreasing.map(formatInterval).join(", ") || "none",
    concaveUp: a.concaveUp.map(formatInterval).join(", ") || "none",
    concaveDown: a.concaveDown.map(formatInterval).join(", ") || "none",
    maxima,
    minima,
    stability:
      a.critical.length === 0
        ? "No stationary operating point in this range — the quantity keeps drifting in one direction."
        : minima.length && !maxima.length
          ? "The system settles at a minimum — a stable operating point (least cost / least energy)."
          : maxima.length && !minima.length
            ? "The system peaks at a maximum — a limiting condition such as peak load or peak stress."
            : "Both peaks and troughs exist — the system oscillates between limiting and stable states.",
  };
}

export function engineeringPrediction(a: Analysis1D) {
  const s = behaviourSummary(a);
  const lines: string[] = [];
  lines.push(
    `The first derivative f'(${a.variable}) = ${a.pretty.d1} measures the rate of change of the engineering quantity. Where it is positive the quantity rises; where it is negative it falls.`,
  );
  if (s.increasing !== "none")
    lines.push(`Rising (positive rate of change) on ${s.increasing}.`);
  if (s.decreasing !== "none")
    lines.push(`Falling (negative rate of change) on ${s.decreasing}.`);
  for (const c of a.critical) {
    lines.push(
      c.type === "maximum"
        ? `Peak value ${c.y} at ${a.variable} = ${c.x} — the design limit / worst-case load point.`
        : c.type === "minimum"
          ? `Lowest value ${c.y} at ${a.variable} = ${c.x} — the most efficient or least-cost operating point.`
          : `At ${a.variable} = ${c.x} the second derivative test is inconclusive; the curve flattens without a true peak.`,
    );
  }
  if (s.concaveUp !== "none")
    lines.push(`Concave upward on ${s.concaveUp}: the rate of change itself is growing (accelerating behaviour).`);
  if (s.concaveDown !== "none")
    lines.push(`Concave downward on ${s.concaveDown}: the rate of change is shrinking (decelerating behaviour).`);
  lines.push(s.stability);
  return lines;
}

export function optimizationInterpretation(c: Critical2D) {
  switch (c.type) {
    case "Local minimum":
      return `Since D = ${c.D} > 0 and f_xx = ${c.fxx} > 0, the point (${c.x}, ${c.y}) is a local minimum. In an engineering cost or energy model these are the optimal design parameters, giving a minimum value of ${c.z}.`;
    case "Local maximum":
      return `Since D = ${c.D} > 0 and f_xx = ${c.fxx} < 0, the point (${c.x}, ${c.y}) is a local maximum — the peak output/efficiency point with value ${c.z}.`;
    case "Saddle point":
      return `Since D = ${c.D} < 0, (${c.x}, ${c.y}) is a saddle point: the design improves along one parameter while it worsens along the other, so it is not an optimum.`;
    default:
      return `The Hessian test is inconclusive at (${c.x}, ${c.y}) because D = 0; a higher-order or numerical check is needed.`;
  }
}
