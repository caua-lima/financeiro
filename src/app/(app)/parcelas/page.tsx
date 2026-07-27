"use client";

import { FormEvent, useState } from "react";
import { formatarMoeda } from "@/lib/types";
import { useParcelas } from "@/lib/useParcelas";

export default function ParcelasPage() {
  const { parcelas, loading, total, adicionar, remover, darBaixa } =
    useParcelas();
  const [nome, setNome] = useState("");
  const [valorParcela, setValorParcela] = useState("");
  const [totalParcelas, setTotalParcelas] = useState("");
  const [pagas, setPagas] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const vParcela = parseFloat(valorParcela.replace(",", "."));
    const vTotal = parseInt(totalParcelas, 10);
    const vPagas = pagas ? Math.min(parseInt(pagas, 10), vTotal) : 0;
    if (!nome.trim() || !vParcela || !vTotal) return;
    const vRestantes = Math.max(0, vTotal - vPagas);
    await adicionar(nome.trim(), vParcela, vTotal, vRestantes);
    setNome("");
    setValorParcela("");
    setTotalParcelas("");
    setPagas("");
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Parcelas</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6"
      >
        <input
          placeholder="Nome (ex: Carro)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="col-span-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <input
          placeholder="Valor parcela"
          inputMode="decimal"
          value={valorParcela}
          onChange={(e) => setValorParcela(e.target.value)}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <input
          placeholder="Total parcelas"
          inputMode="numeric"
          value={totalParcelas}
          onChange={(e) => setTotalParcelas(e.target.value)}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <div className="flex gap-2">
          <input
            placeholder="Já pagas"
            inputMode="numeric"
            value={pagas}
            onChange={(e) => setPagas(e.target.value)}
            className="flex-1 min-w-0 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[#04120e] hover:bg-brand-dark transition-colors"
          >
            +
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-line bg-surface p-4 mb-4 flex justify-between items-center">
        <span className="text-sm text-text-muted">Total mensal em parcelas</span>
        <span className="text-lg font-semibold text-gold">
          {formatarMoeda(total)}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-text-faint">Carregando...</p>
      ) : parcelas.length === 0 ? (
        <p className="text-sm text-text-faint">Nenhuma parcela cadastrada.</p>
      ) : (
        <ul className="space-y-2">
          {parcelas.map((p) => (
            <li
              key={p.id}
              className={`rounded-xl border bg-surface px-4 py-3 ${
                p.parcelasRestantes > 0
                  ? "border-line"
                  : "border-line-soft opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm">{p.nome}</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gold">
                    {formatarMoeda(p.valorParcela)}
                  </span>
                  <button
                    onClick={() => remover(p.id)}
                    className="text-text-faint hover:text-negative text-sm"
                    aria-label="Remover"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-text-faint">
                  Faltam {p.parcelasRestantes} de {p.totalParcelas}
                </p>
                {p.parcelasRestantes > 0 && (
                  <button
                    onClick={() => darBaixa(p.id, p.parcelasRestantes)}
                    className="text-xs text-brand hover:text-brand-dark"
                  >
                    Dar baixa neste mês
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
