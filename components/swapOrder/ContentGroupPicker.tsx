"use client";

import { cn } from "@/lib/utils";
import type { SwapOrderItem, SwapOrderType } from "@/types/swapOrder";

export type ContentGroupOption = {
  key: string;
  parentLabel?: string;
  type: SwapOrderType;
  items: SwapOrderItem[];
};

type Props = {
  groups: ContentGroupOption[];
  activeKey?: string;
  onChange: (key: string) => void;
};

export default function ContentGroupPicker({
  groups,
  activeKey,
  onChange,
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-2 ring-1 ring-slate-200/80 sm:p-2.5">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => {
          const active = group.key === activeKey;
          const label = group.parentLabel ?? group.key;

          return (
            <button
              key={group.key}
              type="button"
              title={label}
              onClick={() => onChange(group.key)}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-xl px-3 py-2.5 text-start transition-colors",
                active
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-slate-50 text-slate-700 ring-1 ring-slate-200/70 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                {label}
              </span>
              <span
                className={cn(
                  "inline-flex shrink-0 min-w-5 items-center justify-center rounded-md px-1.5 text-[11px] font-bold",
                  active
                    ? "bg-white/15 text-white"
                    : "bg-white text-slate-500 ring-1 ring-slate-200/80",
                )}
              >
                {group.items.length}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
