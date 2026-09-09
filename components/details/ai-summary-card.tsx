import { InfoIcon } from "../icons";

interface Props {
  summaryDate: string;
  summaryReadTime: string;
  summary: string[];
}

export function AiSummaryCard({ summaryDate, summaryReadTime, summary }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">AI Summary</p>
        <InfoIcon className="h-4 w-4 text-slate-500" />
      </div>
      <p className="mt-4 text-sm text-slate-500">{summaryDate} · {summaryReadTime}</p>
      <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-800">
        {summary.map((point) => (
          <li key={point} className="list-disc pl-4">{point}</li>
        ))}
      </ul>
      <p className="mt-5 text-xs leading-5 text-slate-500">AI summaries can make mistakes.</p>
      <button className="mt-5 w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
        Provide Feedback
      </button>
    </section>
  );
}
