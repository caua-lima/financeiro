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
  const [restantes, setRestantes] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const vParcela = parseFloat(valorParcela.replace(",", "."));
    const vTotal = parseInt(totalParcelas, 10);
    const vRestantes = restantes ? parseInt(restantes, 10) : vTotal;
    if (!nome.trim() || !vParcela || !vTotal) return;
    await adicionar(nome.trim(), vParcela, vTotal, vRestantes);
    setNome("");
    setValorParcela("");
    setTotalParcelas("");
    setRestantes("");
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
          className="col-span-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <input
          placeholder="Valor parcela"
          inputMode="decimal"
          value={valorParcela}
          onChange={(e) => setValorParcela(e.target.value)}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <input
          placeholder="Total parcelas"
          inputMode="numeric"
          value={totalParcelas}
          onChange={(e) => setTotalParcelas(e.target.value)}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <div className="flex gap-2">
          <input
            placeholder="Faltam"
            inputMode="numeric"
            value={restantes}
            onChange={(e) => setRestantes(e.target.value)}
            className="flex-1 min-w-0 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500"
          >
            +
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-neutral-800 p-4 mb-4 flex justify-between items-center">
        <span className="text-sm text-neutral-400">Total mensal em parcelas</span>
        <span className="text-lg font-semibold text-orange-400">
          {formatarMoeda(total)}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Carregando...</p>
      ) : parcelas.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhuma parcela cadastrada.</p>
      ) : (
        <ul className="space-y-2">
          {parcelas.map((p) => (
            <li
              key={p.id}
              className={`rounded-xl border px-4 py-3 ${
                p.parcelasRestantes > 0
                  ? "border-neutral-800"
                  : "border-neutral-900 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm">{p.nome}</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-orange-400">
                    {formatarMoeda(p.valorParcela)}
                  </span>
                  <button
                    onClick={() => remover(p.id)}
                    className="text-neutral-500 hover:text-red-400 text-sm"
                    aria-label="Remover"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-neutral-500">
                  Faltam {p.parcelasRestantes} de {p.totalParcelas}
                </p>
                {p.parcelasRestantes > 0 && (
                  <button
                    onClick={() => darBaixa(p.id, p.parcelasRestantes)}
                    className="text-xs text-emerald-400 hover:text-emerald-300"
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
