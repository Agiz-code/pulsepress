import { InfoIcon } from "../icons";
import type { SourceEntry } from "../../lib/types";

interface Props {
  totalSources: number;
  breakdown: { left: number; center: number; right: number };
  sourceList: SourceEntry[];
}

const getChipClasses = (bias: SourceEntry["bias"]) => {
  if (bias === "left") return "border border-red-100 bg-red-50 text-red-700";
  if (bias === "right") return "border border-sky-100 bg-sky-50 text-sky-700";
  return "border border-slate-200 bg-slate-100 text-slate-700";
};

export function SourceBreakdownCard({ totalSources, breakdown, sourceList }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">Source Breakdown</p>
        <InfoIcon className="h-4 w-4 text-slate-500" />
      </div>
      <p className="mt-4 text-sm text-slate-500">{totalSources} Total Sources</p>
      <div className="mt-5 space-y-3">
        {[
          { label: "Left", value: `${breakdown.left} (20%)`, color: "bg-red-600" },
          { label: "Center", value: `${breakdown.center} (31%)`, color: "bg-slate-300" },
          { label: "Right", value: `${breakdown.right} (49%)`, color: "bg-sky-600" },
        ].map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{item.label}</span>
              <span className="font-semibold text-slate-900">{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className={`${item.color} h-full rounded-full`} style={{ width: item.label === "Left" ? "20%" : item.label === "Center" ? "31%" : "49%" }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        <div className="text-sm font-semibold text-slate-900">Top Sources</div>
        <div className="space-y-2">
          {sourceList.map((source) => (
            <div key={source.name} className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-800">{source.name}</span>
              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getChipClasses(source.bias)}`}>
                {source.bias.charAt(0).toUpperCase() + source.bias.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <button className="mt-6 w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
        View All Sources
      </button>
    </section>
  );
}
