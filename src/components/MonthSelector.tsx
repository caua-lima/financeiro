"use client";

import { formatarMes } from "@/lib/types";

function somarMes(mes: string, delta: number): string {
  const [ano, m] = mes.split("-").map(Number);
  const data = new Date(ano, m - 1 + delta, 1);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

export function MonthSelector({
  mes,
  onChange,
}: {
  mes: string;
  onChange: (mes: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-6">
      <button
        onClick={() => onChange(somarMes(mes, -1))}
        className="rounded-lg border border-line px-3 py-1.5 text-sm text-text-muted hover:text-text hover:border-brand/40 transition-colors"
      >
        ←
      </button>
      <span className="text-base font-medium capitalize">
        {formatarMes(mes)}
      </span>
      <button
        onClick={() => onChange(somarMes(mes, 1))}
        className="rounded-lg border border-line px-3 py-1.5 text-sm text-text-muted hover:text-text hover:border-brand/40 transition-colors"
      >
        →
      </button>
    </div>
  );
}
