"use client";

import { FormEvent, useState } from "react";
import { mesAtual, formatarMoeda } from "@/lib/types";
import { useGanhos } from "@/lib/useGanhos";
import { MonthSelector } from "@/components/MonthSelector";

export default function GanhosPage() {
  const [mes, setMes] = useState(mesAtual());
  const { ganhos, loading, total, adicionar, remover } = useGanhos(mes);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const numero = parseFloat(valor.replace(",", "."));
    if (!descricao.trim() || !numero) return;
    await adicionar(descricao.trim(), numero);
    setDescricao("");
    setValor("");
  }

  return (
    <div>
      <MonthSelector mes={mes} onChange={setMes} />

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 mb-6 flex-col sm:flex-row"
      >
        <input
          placeholder="Descrição (ex: Salário)"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <input
          placeholder="Valor"
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="w-full sm:w-32 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[#04120e] hover:bg-brand-dark transition-colors"
        >
          Adicionar
        </button>
      </form>

      <div className="rounded-2xl border border-line bg-surface p-4 mb-4 flex justify-between items-center">
        <span className="text-sm text-text-muted">Total do mês</span>
        <span className="text-lg font-semibold text-positive">
          {formatarMoeda(total)}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-text-faint">Carregando...</p>
      ) : ganhos.length === 0 ? (
        <p className="text-sm text-text-faint">
          Nenhum ganho registrado neste mês.
        </p>
      ) : (
        <ul className="space-y-2">
          {ganhos.map((g) => (
            <li
              key={g.id}
              className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3"
            >
              <span className="text-sm">{g.descricao}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-positive">
                  {formatarMoeda(g.valor)}
                </span>
                <button
                  onClick={() => remover(g.id)}
                  className="text-text-faint hover:text-negative text-sm"
                  aria-label="Remover"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
