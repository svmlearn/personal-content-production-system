"use client";

import { useMeeting } from "../meeting-context";

export function MinutesPanel() {
  const { activeMeeting } = useMeeting();
  const s = activeMeeting?.summary;
  if (!s) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">请先生成会议纪要</p>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
        <h3 className="text-sm font-semibold text-indigo-900">会议摘要</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{s.overview}</p>
      </section>

      <section>
        <h3 className="text-sm font-semibold">议题拆分</h3>
        <ul className="mt-2 space-y-2">
          {s.topics.map((t) => (
            <li key={t.id} className="rounded-lg border bg-white p-3 text-sm">
              <p className="font-medium text-slate-900">{t.title}</p>
              <p className="mt-1 text-slate-600">{t.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <ListBlock title="核心结论" items={s.conclusions} />
        <ListBlock title="已做决策" items={s.decisions} />
        <ListBlock title="风险和阻塞" items={s.risks} warn />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold">下一次会议建议</h3>
        <p className="mt-2 text-sm text-slate-600">{s.nextMeetingSuggestion}</p>
      </section>
    </div>
  );
}

function ListBlock({
  title,
  items,
  warn,
}: {
  title: string;
  items: string[];
  warn?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border p-4 ${warn ? "border-amber-200 bg-amber-50/40" : "border-slate-200 bg-white"}`}
    >
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </section>
  );
}
