import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import type { PlotlyImplProps } from "./PlotlyImpl";

const Impl = lazy(() => import("./PlotlyImpl"));

function Skeleton({ height }: { height: number }) {
  return (
    <div
      className="flex w-full animate-pulse items-center justify-center rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground"
      style={{ height }}
    >
      Preparing graph…
    </div>
  );
}

export function Plot({ height = 420, ...rest }: PlotlyImplProps) {
  return (
    <ClientOnly fallback={<Skeleton height={height} />}>
      <Suspense fallback={<Skeleton height={height} />}>
        <Impl height={height} {...rest} />
      </Suspense>
    </ClientOnly>
  );
}
