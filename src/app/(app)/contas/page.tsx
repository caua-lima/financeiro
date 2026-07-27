"use client";

import { FormEvent, useState } from "react";
import { formatarMoeda, ContaFixa } from "@/lib/types";
import { useContasFixas } from "@/lib/useContasFixas";
import { MoneyInput } from "@/components/MoneyInput";

export default function ContasPage() {
  const { contas, loading, total, adicionar, editar, remover, alternarAtiva } =
    useContasFixas();
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState(0);
  const [categoria, setCategoria] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nomeAparado = nome.trim();
    if (!nomeAparado || !valor) return;
    const cat = categoria.trim() || "Geral";
    setNome("");
    setValor(0);
    setCategoria("");
    adicionar(nomeAparado, valor, cat).catch(console.error);
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
          <MoneyInput
            value={valor}
            onChange={setValor}
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
            <ItemConta
              key={c.id}
              conta={c}
              onEditar={editar}
              onRemover={remover}
              onAlternarAtiva={alternarAtiva}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemConta({
  conta,
  onEditar,
  onRemover,
  onAlternarAtiva,
}: {
  conta: ContaFixa;
  onEditar: (
    id: string,
    dados: { nome: string; valor: number; categoria: string }
  ) => void;
  onRemover: (id: string) => void;
  onAlternarAtiva: (id: string, ativa: boolean) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(conta.nome);
  const [valor, setValor] = useState(conta.valor);
  const [categoria, setCategoria] = useState(conta.categoria);

  function salvar() {
    const nomeAparado = nome.trim();
    if (!nomeAparado || !valor) return;
    onEditar(conta.id, {
      nome: nomeAparado,
      valor,
      categoria: categoria.trim() || "Geral",
    });
    setEditando(false);
  }

  if (editando) {
    return (
      <li className="flex flex-col sm:flex-row gap-2 rounded-xl border border-brand/40 bg-surface px-4 py-3">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="flex-1 rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
        />
        <input
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full sm:w-32 rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
        />
        <MoneyInput
          value={valor}
          onChange={setValor}
          className="w-full sm:w-32 rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
        />
        <div className="flex gap-2 shrink-0">
          <button
            onClick={salvar}
            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-[#04120e]"
          >
            Salvar
          </button>
          <button
            onClick={() => setEditando(false)}
            className="rounded-lg border border-line px-3 py-1.5 text-xs text-text-muted"
          >
            Cancelar
          </button>
        </div>
      </li>
    );
  }

  return (
    <li
      className={`flex items-center justify-between rounded-xl border bg-surface px-4 py-3 ${
        conta.ativa ? "border-line" : "border-line-soft opacity-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={conta.ativa}
          onChange={(e) => onAlternarAtiva(conta.id, e.target.checked)}
          className="h-4 w-4 accent-brand"
        />
        <div>
          <p className="text-sm">{conta.nome}</p>
          <p className="text-xs text-text-faint">{conta.categoria}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gold">
          {formatarMoeda(conta.valor)}
        </span>
        <button
          onClick={() => setEditando(true)}
          className="text-text-faint hover:text-brand text-sm"
          aria-label="Editar"
        >
          ✎
        </button>
        <button
          onClick={() => onRemover(conta.id)}
          className="text-text-faint hover:text-negative text-sm"
          aria-label="Remover"
        >
          ✕
        </button>
      </div>
    </li>
  );
}
