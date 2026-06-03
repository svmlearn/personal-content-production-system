import type { ApiDocument } from "@/lib/dev-copilot/types";
import { CodeBlock } from "../code-block";

export function ApiResult({ data }: { data: ApiDocument }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <span className="rounded bg-emerald-600 px-2 py-0.5 font-mono text-xs text-white">
          {data.method}
        </span>
        <span className="ml-2 font-mono font-semibold text-slate-900">
          {data.path}
        </span>
        <h3 className="mt-2 font-semibold">{data.title}</h3>
        <p className="mt-1 text-slate-600">{data.description}</p>
      </div>
      <div>
        <h4 className="font-semibold">Request Body</h4>
        <CodeBlock code={data.requestBody} language="json" />
      </div>
      <div>
        <h4 className="font-semibold">Response</h4>
        <CodeBlock code={data.responseBody} language="json" />
      </div>
      <div>
        <h4 className="font-semibold">错误码</h4>
        <ul className="mt-1 space-y-1 font-mono text-xs text-slate-600">
          {data.errors.map((e) => (
            <li key={e.code}>
              {e.code} — {e.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
