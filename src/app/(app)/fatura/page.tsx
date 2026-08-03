"use client";

import { FormEvent, useState } from "react";
import { mesPadrao, formatarMoeda, FaturaCartao } from "@/lib/types";
import { useFaturasCartao } from "@/lib/useFaturasCartao";
import { MonthSelector } from "@/components/MonthSelector";
import { MoneyInput } from "@/components/MoneyInput";
import { ErroBanner } from "@/components/ErroBanner";

export default function FaturaPage() {
  const [mes, setMes] = useState(mesPadrao());
  const { faturas, loading, erro, total, adicionar, editar, remover } =
    useFaturasCartao(mes);

  const [nome, setNome] = useState("");
  const [valor, setValor] = useState(0);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nomeAparado = nome.trim();
    if (!nomeAparado || !valor) return;
    setNome("");
    setValor(0);
    adicionar(nomeAparado, valor).catch(console.error);
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-1">Fatura do cartão</h1>
      <p className="text-xs text-text-faint mb-4">
        Lance o valor total da fatura de cada cartão neste mês
      </p>
      <MonthSelector mes={mes} onChange={setMes} />
      <ErroBanner mensagem={erro} />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-line bg-surface p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-2"
      >
        <input
          placeholder="Cartão (ex: Nubank)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="sm:col-span-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <div className="flex gap-2">
          <MoneyInput
            value={valor}
            onChange={setValor}
            placeholder="Valor da fatura"
            className="flex-1 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[#0E0F0C] hover:bg-brand-dark transition-colors"
          >
            +
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-line bg-surface p-4 mb-6 flex justify-between items-center">
        <span className="text-sm text-text-muted">Total em faturas do mês</span>
        <span className="text-lg font-semibold text-gold">
          {formatarMoeda(total)}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-text-faint">Carregando...</p>
      ) : faturas.length === 0 ? (
        <p className="text-sm text-text-faint">
          Nenhuma fatura lançada neste mês.
        </p>
      ) : (
        <ul className="space-y-2">
          {faturas.map((f) => (
            <ItemFatura
              key={f.id}
              fatura={f}
              onEditar={editar}
              onRemover={remover}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemFatura({
  fatura,
  onEditar,
  onRemover,
}: {
  fatura: FaturaCartao;
  onEditar: (id: string, dados: { nome: string; valor: number }) => void;
  onRemover: (id: string) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(fatura.nome);
  const [valor, setValor] = useState(fatura.valor);

  function salvar() {
    const nomeAparado = nome.trim();
    if (!nomeAparado || !valor) return;
    onEditar(fatura.id, { nome: nomeAparado, valor });
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
        <MoneyInput
          value={valor}
          onChange={setValor}
          className="w-full sm:w-32 rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
        />
        <div className="flex gap-2 shrink-0">
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
    <li className="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface px-4 py-3">
      <span className="text-sm truncate">{fatura.nome}</span>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-medium text-gold">
          {formatarMoeda(fatura.valor)}
        </span>
        <button
          onClick={() => setEditando(true)}
          className="text-text-faint hover:text-brand text-sm"
          aria-label="Editar"
        >
          ✎
        </button>
        <button
          onClick={() => onRemover(fatura.id)}
          className="text-text-faint hover:text-negative text-sm"
          aria-label="Remover"
        >
          ✕
        </button>
      </div>
    </li>
  );
}
