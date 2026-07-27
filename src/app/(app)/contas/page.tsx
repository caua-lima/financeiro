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
          className="sm:col-span-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <input
          placeholder="Categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <div className="flex gap-2">
          <input
            placeholder="Valor"
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
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
        <span className="text-sm text-text-muted">Total ativo mensal</span>
        <span className="text-lg font-semibold text-gold">
          {formatarMoeda(total)}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-text-faint">Carregando...</p>
      ) : contas.length === 0 ? (
        <p className="text-sm text-text-faint">
          Nenhuma conta fixa cadastrada.
        </p>
      ) : (
        <ul className="space-y-2">
          {contas.map((c) => (
            <li
              key={c.id}
              className={`flex items-center justify-between rounded-xl border bg-surface px-4 py-3 ${
                c.ativa ? "border-line" : "border-line-soft opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={c.ativa}
                  onChange={(e) => alternarAtiva(c.id, e.target.checked)}
                  className="h-4 w-4 accent-brand"
                />
                <div>
                  <p className="text-sm">{c.nome}</p>
                  <p className="text-xs text-text-faint">{c.categoria}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gold">
                  {formatarMoeda(c.valor)}
                </span>
                <button
                  onClick={() => remover(c.id)}
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
