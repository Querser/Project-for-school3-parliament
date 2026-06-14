import * as React from "react";

import { cn } from "@/lib/utils/cn";

export type InputProps = React.ComponentProps<"input">;

export function Input(props: InputProps) {
  const inputProps = Object.assign({}, props, {
    className: cn(
      "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200",
      props.className,
    ),
  });

  return React.createElement("input", inputProps);
}
