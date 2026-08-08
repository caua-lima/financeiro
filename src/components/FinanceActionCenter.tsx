"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FinanceAlert, Severidade } from "@/lib/finance/alerts";

const CONFIG_SEVERIDADE: Record<
  Severidade,
  { label: string; simbolo: string; cor: string; bg: string; borda: string }
> = {
  critical: {
    label: "Crítico",
    simbolo: "⚠",
    cor: "text-negative",
    bg: "bg-negative-soft",
    borda: "border-negative/30",
  },
  warning: {
    label: "Atenção",
    simbolo: "◆",
    cor: "text-gold",
    bg: "bg-gold-soft",
    borda: "border-gold/30",
  },
  opportunity: {
    label: "Oportunidade",
    simbolo: "↗",
    cor: "text-positive",
    bg: "bg-positive-soft",
    borda: "border-positive/30",
  },
  info: {
    label: "Info",
    simbolo: "ℹ",
    cor: "text-info",
    bg: "bg-info/10",
    borda: "border-info/30",
  },
};

const CHAVE_DISPENSADOS = "financeiro:alertas-dispensados";

function carregarDispensados(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const bruto = window.localStorage.getItem(CHAVE_DISPENSADOS);
    return new Set(bruto ? (JSON.parse(bruto) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function FinanceActionCenter({ alertas }: { alertas: FinanceAlert[] }) {
  const [dispensados, setDispensados] = useState<Set<string>>(new Set());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lê localStorage só depois de montar (evita mismatch de SSR)
    setDispensados(carregarDispensados());
  }, []);

  function dispensar(key: string) {
    const novo = new Set(dispensados);
    novo.add(key);
    setDispensados(novo);
    window.localStorage.setItem(CHAVE_DISPENSADOS, JSON.stringify([...novo]));
  }

  const visiveis = alertas.filter((a) => !dispensados.has(a.key));

  if (visiveis.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-5 text-center">
        <p className="text-sm text-text-muted">
          Nada pedindo sua atenção agora. 🎯
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visiveis.map((a) => {
        const c = CONFIG_SEVERIDADE[a.severidade];
        return (
          <div
            key={a.key}
            className={`rounded-xl border ${c.borda} ${c.bg} px-4 py-3`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-semibold ${c.cor}`} aria-hidden="true">
                    {c.simbolo}
                  </span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${c.cor}`}>
                    {c.label}
                  </span>
                </div>
                <p className="text-sm font-medium text-text truncate">{a.titulo}</p>
                <p className="text-xs text-text-muted mt-0.5">{a.contexto}</p>
                {a.impacto && a.impacto !== "—" && (
                  <p className={`text-sm font-semibold mt-1 ${c.cor}`}>{a.impacto}</p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                {a.href && (
                  <Link
                    href={a.href}
                    className="text-xs font-medium text-brand hover:text-brand-dark whitespace-nowrap"
                  >
                    {a.cta}
                  </Link>
                )}
                <button
                  onClick={() => dispensar(a.key)}
                  className="text-[11px] text-text-faint hover:text-text-muted"
                  aria-label="Dispensar alerta"
                >
                  Dispensar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
