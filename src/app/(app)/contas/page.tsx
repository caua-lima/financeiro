"use client";

import { FormEvent, useState } from "react";
import { formatarMoeda } from "@/lib/types";
import { useContasFixas } from "@/lib/useContasFixas";

export default function ContasPage() {
  const { contas, loading, total, adicionar, remover, alternarAtiva } =
    useContasFixas();
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const numero = parseFloat(valor.replace(",", "."));
    if (!nome.trim() || !numero) return;
    await adicionar(nome.trim(), numero, categoria.trim() || "Geral");
    setNome("");
    setValor("");
    setCategoria("");
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Contas fixas</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-6"
      >
        <input
          placeholder="Nome (ex: Internet)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="sm:col-span-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <input
          placeholder="Categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <div className="flex gap-2">
          <input
            placeholder="Valor"
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
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
        <span className="text-sm text-neutral-400">Total ativo mensal</span>
        <span className="text-lg font-semibold text-orange-400">
          {formatarMoeda(total)}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Carregando...</p>
      ) : contas.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Nenhuma conta fixa cadastrada.
        </p>
      ) : (
        <ul className="space-y-2">
          {contas.map((c) => (
            <li
              key={c.id}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                c.ativa
                  ? "border-neutral-800"
                  : "border-neutral-900 opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={c.ativa}
                  onChange={(e) => alternarAtiva(c.id, e.target.checked)}
                  className="h-4 w-4 accent-emerald-600"
                />
                <div>
                  <p className="text-sm">{c.nome}</p>
                  <p className="text-xs text-neutral-500">{c.categoria}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-orange-400">
                  {formatarMoeda(c.valor)}
                </span>
                <button
                  onClick={() => remover(c.id)}
                  className="text-neutral-500 hover:text-red-400 text-sm"
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
