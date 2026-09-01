import katex from "katex";
import { useMemo } from "react";

export function Tex({ tex, block = false, className = "" }: { tex: string; block?: boolean; className?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, { displayMode: block, throwOnError: false });
    } catch {
      return tex;
    }
  }, [tex, block]);
  return (
    <span
      className={`katex-host ${block ? "block overflow-x-auto py-1" : "inline-block"} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
