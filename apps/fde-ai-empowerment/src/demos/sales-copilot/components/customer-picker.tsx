"use client";

import { CUSTOMERS } from "@/lib/sales-copilot/mock-data";
import { useSales } from "../sales-context";

export function CustomerPicker({ compact }: { compact?: boolean }) {
  const { selectedCustomerId, setSelectedCustomerId } = useSales();

  return (
    <select
      value={selectedCustomerId}
      onChange={(e) => setSelectedCustomerId(e.target.value)}
      className={`rounded-lg border border-slate-200 bg-white text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 ${
        compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
      }`}
    >
      {CUSTOMERS.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
