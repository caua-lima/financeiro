"use client";

import { useState } from "react";
import { mesPadrao, formatarMoeda, FaturaCartao } from "@/lib/types";
import { useFaturasCartao } from "@/lib/useFaturasCartao";
import { MonthSelector } from "@/components/MonthSelector";
import { MoneyInput } from "@/components/MoneyInput";
import { ErroBanner } from "@/components/ErroBanner";

export default function FaturaPage() {
  const [mes, setMes] = useState(mesPadrao());
  const { faturas, loading, erro, total, salvar } = useFaturasCartao(mes);

  return (
    <div>
      <h1 className="text-lg font-semibold mb-1">Fatura do cartão</h1>
      <p className="text-xs text-text-faint mb-4">
        Lance o valor total da fatura de cada cartão neste mês — fica
        zerado enquanto não lançar
      </p>
      <MonthSelector mes={mes} onChange={setMes} />
      <ErroBanner mensagem={erro} />

      <div className="rounded-2xl border border-line bg-surface p-4 mb-6 flex justify-between items-center">
        <span className="text-sm text-text-muted">Total em faturas do mês</span>
        <span className="text-lg font-semibold text-gold">
          {formatarMoeda(total)}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-text-faint">Carregando...</p>
      ) : (
        <ul className="space-y-2">
          {faturas.map((f) => (
            <ItemFatura key={`${mes}-${f.nome}`} fatura={f} onSalvar={salvar} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemFatura({
  fatura,
  onSalvar,
}: {
  fatura: FaturaCartao;
  onSalvar: (cartao: string, valor: number) => void;
}) {
  const [valor, setValor] = useState(fatura.valor);
  const alterado = valor !== fatura.valor;

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      <span className="text-sm min-w-0 truncate">💳 {fatura.nome}</span>
      <div className="flex items-center gap-2 shrink-0">
        <MoneyInput
          value={valor}
          onChange={setValor}
          className="w-32 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-sm outline-none focus:border-brand text-right"
        />
        <button
          onClick={() => onSalvar(fatura.nome, valor)}
          disabled={!alterado}
          className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-[#0E0F0C] disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          Salvar
        </button>
      </div>
    </li>
  );
}
