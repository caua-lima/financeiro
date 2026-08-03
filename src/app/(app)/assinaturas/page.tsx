"use client";

import { FormEvent, useState } from "react";
import { formatarMoeda, Assinatura } from "@/lib/types";
import { useAssinaturas } from "@/lib/useAssinaturas";
import { MoneyInput } from "@/components/MoneyInput";
import { ErroBanner } from "@/components/ErroBanner";

export default function AssinaturasPage() {
  const {
    assinaturas,
    loading,
    erro,
    total,
    adicionar,
    editar,
    remover,
    alternarAtiva,
  } = useAssinaturas();

  const [nome, setNome] = useState("");
  const [valor, setValor] = useState(0);
  const [naFatura, setNaFatura] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nomeAparado = nome.trim();
    if (!nomeAparado || !valor) return;
    setNome("");
    setValor(0);
    setNaFatura(false);
    adicionar(nomeAparado, valor, naFatura).catch(console.error);
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Assinaturas</h1>
      <ErroBanner mensagem={erro} />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-line bg-surface p-4 mb-6 space-y-2"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            placeholder="Nome (ex: Netflix)"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="sm:col-span-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <div className="flex gap-2">
            <MoneyInput
              value={valor}
              onChange={setValor}
              className="flex-1 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <button
              type="submit"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[#0E0F0C] hover:bg-brand-dark transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={naFatura}
            onChange={(e) => setNaFatura(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          Já está na fatura do cartão (não contar de novo no total)
        </label>
      </form>

      <div className="rounded-2xl border border-line bg-surface p-4 mb-6 flex justify-between items-center">
        <span className="text-sm text-text-muted">Total ativo mensal</span>
        <span className="text-lg font-semibold text-gold">
          {formatarMoeda(total)}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-text-faint">Carregando...</p>
      ) : assinaturas.length === 0 ? (
        <p className="text-sm text-text-faint">
          Nenhuma assinatura cadastrada.
        </p>
      ) : (
        <ul className="space-y-2">
          {assinaturas.map((a) => (
            <ItemAssinatura
              key={a.id}
              assinatura={a}
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

function ItemAssinatura({
  assinatura,
  onEditar,
  onRemover,
  onAlternarAtiva,
}: {
  assinatura: Assinatura;
  onEditar: (
    id: string,
    dados: { nome: string; valor: number; naFatura?: boolean }
  ) => void;
  onRemover: (id: string) => void;
  onAlternarAtiva: (id: string, ativa: boolean) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(assinatura.nome);
  const [valor, setValor] = useState(assinatura.valor);
  const [naFatura, setNaFatura] = useState(!!assinatura.naFatura);

  function salvar() {
    const nomeAparado = nome.trim();
    if (!nomeAparado || !valor) return;
    onEditar(assinatura.id, { nome: nomeAparado, valor, naFatura });
    setEditando(false);
  }

  if (editando) {
    return (
      <li className="rounded-xl border border-brand/40 bg-surface px-4 py-3 space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="flex-1 rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
          />
          <MoneyInput
            value={valor}
            onChange={setValor}
            className="w-full sm:w-32 rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={naFatura}
            onChange={(e) => setNaFatura(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          Já está na fatura do cartão (não contar de novo no total)
        </label>
        <div className="flex gap-2">
          <button
            onClick={salvar}
            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-[#0E0F0C]"
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
      className={`flex items-center justify-between gap-2 rounded-xl border bg-surface px-4 py-3 ${
        assinatura.ativa ? "border-line" : "border-line-soft opacity-50"
      }`}
    >
      <label className="flex items-center gap-3 min-w-0 cursor-pointer">
        <input
          type="checkbox"
          checked={assinatura.ativa}
          onChange={(e) => onAlternarAtiva(assinatura.id, e.target.checked)}
          className="h-4 w-4 shrink-0 accent-brand"
        />
        <div className="min-w-0">
          <p className="text-sm truncate">{assinatura.nome}</p>
          {assinatura.naFatura && (
            <p className="text-xs text-text-faint">já na fatura do cartão</p>
          )}
        </div>
      </label>
      <div className="flex items-center gap-3 shrink-0">
        <span
          className={`text-sm font-medium ${
            assinatura.naFatura ? "text-text-faint" : "text-gold"
          }`}
        >
          {formatarMoeda(assinatura.valor)}
        </span>
        <button
          onClick={() => setEditando(true)}
          className="text-text-faint hover:text-brand text-sm"
          aria-label="Editar"
        >
          ✎
        </button>
        <button
          onClick={() => onRemover(assinatura.id)}
          className="text-text-faint hover:text-negative text-sm"
          aria-label="Remover"
        >
          ✕
        </button>
      </div>
    </li>
  );
}
