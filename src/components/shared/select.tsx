import * as React from "react";

import { cn } from "@/lib/utils/cn";

export type SelectProps = React.ComponentProps<"select">;

export function Select(props: SelectProps) {
  const selectProps = Object.assign({}, props, {
    className: cn(
      "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200",
      props.className,
    ),
  });

  return React.createElement("select", selectProps, props.children);
}
