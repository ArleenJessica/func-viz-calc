import { useEffect, useRef } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- dist bundle has no bundled types
import Plotly from "plotly.js-dist-min";

export type PlotlyImplProps = {
  data: unknown[];
  layout?: Record<string, unknown>;
  height?: number;
};

function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export default function PlotlyImpl({ data, layout, height = 420 }: PlotlyImplProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fg = cssVar("--color-foreground", "#e2e8f0");
    const grid = cssVar("--color-border", "#33415580");
    const merged = {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: { color: fg, family: "'IBM Plex Mono', ui-monospace, monospace", size: 12 },
      margin: { l: 50, r: 20, t: 30, b: 45 },
      showlegend: true,
      legend: { orientation: "h", y: -0.18 },
      hovermode: "closest",
      xaxis: { gridcolor: grid, zerolinecolor: grid },
      yaxis: { gridcolor: grid, zerolinecolor: grid },
      ...layout,
    };
    void Plotly.react(el, data, merged, {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ["lasso2d", "select2d"],
    });
    return () => {
      Plotly.purge(el);
    };
  }, [data, layout]);

  return <div ref={ref} style={{ width: "100%", height }} />;
}
