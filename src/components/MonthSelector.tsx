"use client";

import { formatarMes, mesPadrao } from "@/lib/types";

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
  const minimo = mesPadrao();
  const podeVoltar = mes > minimo;

  return (
    <div className="flex items-center justify-between gap-3 mb-6">
      <button
        onClick={() => podeVoltar && onChange(somarMes(mes, -1))}
        disabled={!podeVoltar}
        className="rounded-lg border border-line px-3 py-1.5 text-sm text-text-muted transition-colors enabled:hover:text-text enabled:hover:border-brand/40 disabled:opacity-30 disabled:cursor-not-allowed"
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
