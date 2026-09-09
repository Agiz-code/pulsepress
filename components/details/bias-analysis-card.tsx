import { InfoIcon } from "../icons";

interface Props {
  overallBiasLabel: string;
  overallBiasPercent: number;
  sources: number;
  bias: { left: number; center: number; right: number };
}

const labelColor = (label: string) => {
  if (label === "left") return "text-red-700";
  if (label === "right") return "text-sky-700";
  return "text-slate-900";
};

export function BiasAnalysisCard({ overallBiasLabel, overallBiasPercent, sources, bias }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Bias Analysis</p>
        </div>
        <InfoIcon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="mt-5 space-y-3">
        <p className="text-sm text-slate-500">Overall Bias</p>
        <div className="flex items-end gap-3">
          <p className={`text-3xl font-semibold ${labelColor(overallBiasLabel)}`}>{`${overallBiasLabel.charAt(0).toUpperCase() + overallBiasLabel.slice(1)} ${overallBiasPercent}%`}</p>
        </div>
        <p className="text-sm text-slate-500">Based on {sources} balanced sources</p>
      </div>
      <div className="mt-6 space-y-3">
        {[
          { label: "Left", value: bias.left, color: "bg-red-600" },
          { label: "Center", value: bias.center, color: "bg-slate-300" },
          { label: "Right", value: bias.right, color: "bg-sky-600" },
        ].map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{item.label}</span>
              <span className="font-semibold text-slate-900">{item.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <button className="mt-6 w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
        How We Analyze Bias
      </button>
    </section>
  );
}
