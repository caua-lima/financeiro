"use client";

import { FormEvent, useState } from "react";
import { formatarMoeda, Parcela } from "@/lib/types";
import { useParcelas } from "@/lib/useParcelas";
import { MoneyInput } from "@/components/MoneyInput";
import { ErroBanner } from "@/components/ErroBanner";

export default function ParcelasPage() {
  const {
    parcelas,
    loading,
    erro,
    total,
    adicionar,
    editar,
    remover,
    darBaixa,
  } = useParcelas();
  const [nome, setNome] = useState("");
  const [valorParcela, setValorParcela] = useState(0);
  const [totalParcelas, setTotalParcelas] = useState("");
  const [pagas, setPagas] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nomeAparado = nome.trim();
    const vTotal = parseInt(totalParcelas, 10);
    if (!nomeAparado || !valorParcela || !vTotal) return;
    const vPagas = pagas ? Math.min(parseInt(pagas, 10), vTotal) : 0;
    const vRestantes = Math.max(0, vTotal - vPagas);
    setNome("");
    setValorParcela(0);
    setTotalParcelas("");
    setPagas("");
    adicionar(nomeAparado, valorParcela, vTotal, vRestantes).catch(
      console.error
    );
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Parcelas</h1>
      <ErroBanner mensagem={erro} />

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
        <MoneyInput
          value={valorParcela}
          onChange={setValorParcela}
          placeholder="Valor parcela"
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
            <ItemParcela
              key={p.id}
              parcela={p}
              onEditar={editar}
              onRemover={remover}
              onDarBaixa={darBaixa}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemParcela({
  parcela,
  onEditar,
  onRemover,
  onDarBaixa,
}: {
  parcela: Parcela;
  onEditar: (
    id: string,
    dados: {
      nome: string;
      valorParcela: number;
      totalParcelas: number;
      parcelasRestantes: number;
    }
  ) => void;
  onRemover: (id: string) => void;
  onDarBaixa: (id: string, parcelasRestantes: number) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(parcela.nome);
  const [valorParcela, setValorParcela] = useState(parcela.valorParcela);
  const [totalParcelas, setTotalParcelas] = useState(
    String(parcela.totalParcelas)
  );
  const [pagas, setPagas] = useState(
    String(parcela.totalParcelas - parcela.parcelasRestantes)
  );

  function salvar() {
    const nomeAparado = nome.trim();
    const vTotal = parseInt(totalParcelas, 10);
    if (!nomeAparado || !valorParcela || !vTotal) return;
    const vPagas = pagas ? Math.min(parseInt(pagas, 10), vTotal) : 0;
    onEditar(parcela.id, {
      nome: nomeAparado,
      valorParcela,
      totalParcelas: vTotal,
      parcelasRestantes: Math.max(0, vTotal - vPagas),
    });
    setEditando(false);
  }

  if (editando) {
    return (
      <li className="rounded-xl border border-brand/40 bg-surface px-4 py-3 space-y-2">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
        />
        <div className="grid grid-cols-3 gap-2">
          <MoneyInput
            value={valorParcela}
            onChange={setValorParcela}
            placeholder="Valor parcela"
            className="rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
          />
          <input
            placeholder="Total"
            inputMode="numeric"
            value={totalParcelas}
            onChange={(e) => setTotalParcelas(e.target.value)}
            className="rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
          />
          <input
            placeholder="Já pagas"
            inputMode="numeric"
            value={pagas}
            onChange={(e) => setPagas(e.target.value)}
            className="rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
          />
        </div>
        <div className="flex gap-2">
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
      className={`rounded-xl border bg-surface px-4 py-3 ${
        parcela.parcelasRestantes > 0
          ? "border-line"
          : "border-line-soft opacity-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm">{parcela.nome}</p>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gold">
            {formatarMoeda(parcela.valorParcela)}
          </span>
          <button
            onClick={() => setEditando(true)}
            className="text-text-faint hover:text-brand text-sm"
            aria-label="Editar"
          >
            ✎
          </button>
          <button
            onClick={() => onRemover(parcela.id)}
            className="text-text-faint hover:text-negative text-sm"
            aria-label="Remover"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-text-faint">
          Faltam {parcela.parcelasRestantes} de {parcela.totalParcelas}
        </p>
        {parcela.parcelasRestantes > 0 && (
          <button
            onClick={() => onDarBaixa(parcela.id, parcela.parcelasRestantes)}
            className="text-xs text-brand hover:text-brand-dark"
          >
            Dar baixa neste mês
          </button>
        )}
      </div>
    </li>
  );
}
