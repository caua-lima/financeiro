"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  formatarMoeda,
  Parcela,
  TipoParcela,
  valorMinhaParte,
} from "@/lib/types";
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
  const [tipo, setTipo] = useState<TipoParcela>("cartao");
  const [dividida, setDividida] = useState(false);

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
    setDividida(false);
    adicionar(nomeAparado, valorParcela, vTotal, vRestantes, tipo, dividida).catch(
      console.error
    );
  }

  const grupos = useMemo(() => {
    const cartao = parcelas.filter((p) => p.tipo === "cartao" || !p.tipo);
    const financiamento = parcelas.filter((p) => p.tipo === "financiamento");
    return { cartao, financiamento };
  }, [parcelas]);

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Parcelas</h1>
      <ErroBanner mensagem={erro} />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-line bg-surface p-4 mb-6 space-y-2"
      >
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setTipo("cartao")}
            className={`rounded-full px-3 py-1 border transition-colors ${
              tipo === "cartao"
                ? "border-brand bg-brand-soft text-brand"
                : "border-line text-text-faint"
            }`}
          >
            Cartão de crédito
          </button>
          <button
            type="button"
            onClick={() => setTipo("financiamento")}
            className={`rounded-full px-3 py-1 border transition-colors ${
              tipo === "financiamento"
                ? "border-brand bg-brand-soft text-brand"
                : "border-line text-text-faint"
            }`}
          >
            Financiamento
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <input
            placeholder={
              tipo === "cartao" ? "Nome (ex: Notebook)" : "Nome (ex: Carro)"
            }
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="col-span-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <MoneyInput
            value={valorParcela}
            onChange={setValorParcela}
            placeholder="Valor parcela"
            className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <input
            placeholder="Total parcelas"
            inputMode="numeric"
            value={totalParcelas}
            onChange={(e) => setTotalParcelas(e.target.value)}
            className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <input
            placeholder="Já pagas"
            inputMode="numeric"
            value={pagas}
            onChange={(e) => setPagas(e.target.value)}
            className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={dividida}
            onChange={(e) => setDividida(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          Dividida (você paga só a metade)
        </label>

        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[#0E0F0C] hover:bg-brand-dark transition-colors"
        >
          Adicionar
        </button>
      </form>

      <div className="rounded-2xl border border-line bg-surface p-4 mb-6 flex justify-between items-center">
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
        <div className="space-y-5">
          <GrupoParcelas
            titulo="Cartão de crédito"
            itens={grupos.cartao}
            onEditar={editar}
            onRemover={remover}
            onDarBaixa={darBaixa}
          />
          <GrupoParcelas
            titulo="Financiamento"
            itens={grupos.financiamento}
            onEditar={editar}
            onRemover={remover}
            onDarBaixa={darBaixa}
          />
        </div>
      )}
    </div>
  );
}

function GrupoParcelas({
  titulo,
  itens,
  onEditar,
  onRemover,
  onDarBaixa,
}: {
  titulo: string;
  itens: Parcela[];
  onEditar: (
    id: string,
    dados: {
      nome: string;
      valorParcela: number;
      totalParcelas: number;
      parcelasRestantes: number;
      tipo: TipoParcela;
      dividida?: boolean;
    }
  ) => void;
  onRemover: (id: string) => void;
  onDarBaixa: (id: string, parcelasRestantes: number) => void;
}) {
  if (itens.length === 0) return null;

  const subtotal = itens
    .filter((p) => p.parcelasRestantes > 0)
    .reduce((acc, p) => acc + valorMinhaParte(p), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-sm font-medium text-text-muted">{titulo}</h2>
        <span className="text-xs text-text-faint">
          {formatarMoeda(subtotal)}
        </span>
      </div>
      <ul className="space-y-2">
        {itens.map((p) => (
          <ItemParcela
            key={p.id}
            parcela={p}
            onEditar={onEditar}
            onRemover={onRemover}
            onDarBaixa={onDarBaixa}
          />
        ))}
      </ul>
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
      tipo: TipoParcela;
      dividida?: boolean;
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
  const [tipo, setTipo] = useState<TipoParcela>(parcela.tipo ?? "cartao");
  const [dividida, setDividida] = useState(!!parcela.dividida);

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
      tipo,
      dividida,
    });
    setEditando(false);
  }

  if (editando) {
    return (
      <li className="rounded-xl border border-brand/40 bg-surface px-4 py-3 space-y-2">
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setTipo("cartao")}
            className={`rounded-full px-3 py-1 border transition-colors ${
              tipo === "cartao"
                ? "border-brand bg-brand-soft text-brand"
                : "border-line text-text-faint"
            }`}
          >
            Cartão
          </button>
          <button
            type="button"
            onClick={() => setTipo("financiamento")}
            className={`rounded-full px-3 py-1 border transition-colors ${
              tipo === "financiamento"
                ? "border-brand bg-brand-soft text-brand"
                : "border-line text-text-faint"
            }`}
          >
            Financiamento
          </button>
        </div>
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
        <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={dividida}
            onChange={(e) => setDividida(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          Dividida (você paga só a metade)
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
      className={`rounded-xl border bg-surface px-4 py-3 ${
        parcela.parcelasRestantes > 0
          ? "border-line"
          : "border-line-soft opacity-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm">{parcela.nome}</p>
          {parcela.dividida && (
            <p className="text-xs text-text-faint">
              Total {formatarMoeda(parcela.valorParcela)} · você paga metade
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gold">
            {formatarMoeda(valorMinhaParte(parcela))}
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
          Faltam {parcela.parcelasRestantes} de {parcela.totalParcelas} ·{" "}
          {parcela.totalParcelas - parcela.parcelasRestantes} pagas
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
