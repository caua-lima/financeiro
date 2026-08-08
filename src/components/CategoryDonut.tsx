"use client";

import { formatarMoeda } from "@/lib/types";
import { GrupoPorCategoria } from "@/lib/finance/entries";

const CORES = [
  "var(--color-brand)",
  "var(--color-info)",
  "var(--color-positive)",
  "var(--color-gold)",
  "var(--color-negative)",
  "#9b8cf2",
];
const COR_OUTROS = "var(--color-text-faint)";

export function CategoryDonut({ grupos }: { grupos: GrupoPorCategoria[] }) {
  const total = grupos.reduce((acc, g) => acc + g.total, 0);

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-5 text-center">
        <p className="text-sm text-text-faint">Sem despesas registradas ainda neste mês.</p>
      </div>
    );
  }

  const principais = grupos.slice(0, 6);
  const restante = grupos.slice(6);
  const totalOutros = restante.reduce((acc, g) => acc + g.total, 0);
  const fatias = [
    ...principais.map((g, i) => ({ nome: g.categoryId, valor: g.total, cor: CORES[i] })),
    ...(totalOutros > 0 ? [{ nome: "Outros", valor: totalOutros, cor: COR_OUTROS }] : []),
  ];

  const raio = 15.9155;
  const circunferencia = 2 * Math.PI * raio;
  let acumulado = 0;

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <h2 className="text-sm font-medium text-text-muted mb-4">Distribuição de gastos</h2>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 36 36" className="w-28 h-28 shrink-0 -rotate-90">
          <circle cx="18" cy="18" r={raio} fill="none" stroke="var(--color-surface-2)" strokeWidth="4" />
          {fatias.map((f) => {
            const fracao = f.valor / total;
            const comprimento = fracao * circunferencia;
            const dasharray = `${comprimento} ${circunferencia - comprimento}`;
            const dashoffset = -acumulado;
            acumulado += comprimento;
            return (
              <circle
                key={f.nome}
                cx="18"
                cy="18"
                r={raio}
                fill="none"
                stroke={f.cor}
                strokeWidth="4"
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
              />
            );
          })}
        </svg>
        <ul className="flex-1 min-w-0 space-y-1.5">
          {fatias.map((f) => (
            <li key={f.nome} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: f.cor }} />
                <span className="truncate text-text-muted capitalize">{f.nome}</span>
              </span>
              <span className="shrink-0 text-text">
                {formatarMoeda(f.valor)} · {((f.valor / total) * 100).toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
