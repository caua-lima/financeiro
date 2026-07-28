"use client";

import { FormEvent, useMemo, useState } from "react";
import { formatarMoeda, Parcela, TipoParcela } from "@/lib/types";
import { useParcelas } from "@/lib/useParcelas";
import { useCartoes } from "@/lib/useCartoes";
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
  const { cartoes } = useCartoes();

  const [nome, setNome] = useState("");
  const [valorParcela, setValorParcela] = useState(0);
  const [totalParcelas, setTotalParcelas] = useState("");
  const [pagas, setPagas] = useState("");
  const [tipo, setTipo] = useState<TipoParcela>("cartao");
  const [cartaoId, setCartaoId] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nomeAparado = nome.trim();
    const vTotal = parseInt(totalParcelas, 10);
    if (!nomeAparado || !valorParcela || !vTotal) return;
    if (tipo === "cartao" && !cartaoId) return;
    const vPagas = pagas ? Math.min(parseInt(pagas, 10), vTotal) : 0;
    const vRestantes = Math.max(0, vTotal - vPagas);
    setNome("");
    setValorParcela(0);
    setTotalParcelas("");
    setPagas("");
    adicionar(
      nomeAparado,
      valorParcela,
      vTotal,
      vRestantes,
      tipo,
      tipo === "cartao" ? cartaoId : undefined
    ).catch(console.error);
  }

  const grupos = useMemo(() => {
    const financiamentos = parcelas.filter((p) => p.tipo === "financiamento");
    const porCartao = cartoes.map((c) => ({
      cartao: c,
      itens: parcelas.filter(
        (p) => p.tipo === "cartao" && p.cartaoId === c.id
      ),
    }));
    const semCartao = parcelas.filter(
      (p) =>
        p.tipo === "cartao" &&
        (!p.cartaoId || !cartoes.some((c) => c.id === p.cartaoId))
    );
    return { financiamentos, porCartao, semCartao };
  }, [parcelas, cartoes]);

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
            💳 Cartão de crédito
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
            🏦 Financiamento
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

        {tipo === "cartao" && (
          <div>
            {cartoes.length === 0 ? (
              <p className="text-xs text-text-faint">
                Você ainda não cadastrou nenhum cartão. Vá em{" "}
                <a href="/cartoes" className="text-brand hover:text-brand-dark">
                  Cartões
                </a>{" "}
                pra cadastrar um antes.
              </p>
            ) : (
              <select
                value={cartaoId}
                onChange={(e) => setCartaoId(e.target.value)}
                className="w-full sm:w-64 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand"
              >
                <option value="">Qual cartão?</option>
                {cartoes.map((c) => (
                  <option key={c.id} value={c.id}>
                    💳 {c.nome}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[#04120e] hover:bg-brand-dark transition-colors"
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
            titulo="🏦 Financiamentos"
            itens={grupos.financiamentos}
            cartoes={cartoes}
            onEditar={editar}
            onRemover={remover}
            onDarBaixa={darBaixa}
          />
          {grupos.porCartao.map(
            ({ cartao, itens }) =>
              itens.length > 0 && (
                <GrupoParcelas
                  key={cartao.id}
                  titulo={`💳 ${cartao.nome}`}
                  itens={itens}
                  cartoes={cartoes}
                  onEditar={editar}
                  onRemover={remover}
                  onDarBaixa={darBaixa}
                />
              )
          )}
          <GrupoParcelas
            titulo="💳 Cartão removido"
            itens={grupos.semCartao}
            cartoes={cartoes}
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
  cartoes,
  onEditar,
  onRemover,
  onDarBaixa,
}: {
  titulo: string;
  itens: Parcela[];
  cartoes: { id: string; nome: string }[];
  onEditar: (
    id: string,
    dados: {
      nome: string;
      valorParcela: number;
      totalParcelas: number;
      parcelasRestantes: number;
      tipo: TipoParcela;
      cartaoId?: string;
    }
  ) => void;
  onRemover: (id: string) => void;
  onDarBaixa: (id: string, parcelasRestantes: number) => void;
}) {
  if (itens.length === 0) return null;

  const subtotal = itens
    .filter((p) => p.parcelasRestantes > 0)
    .reduce((acc, p) => acc + p.valorParcela, 0);

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
            cartoes={cartoes}
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
  cartoes,
  onEditar,
  onRemover,
  onDarBaixa,
}: {
  parcela: Parcela;
  cartoes: { id: string; nome: string }[];
  onEditar: (
    id: string,
    dados: {
      nome: string;
      valorParcela: number;
      totalParcelas: number;
      parcelasRestantes: number;
      tipo: TipoParcela;
      cartaoId?: string;
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
  const [tipo, setTipo] = useState<TipoParcela>(parcela.tipo);
  const [cartaoId, setCartaoId] = useState(parcela.cartaoId ?? "");

  function salvar() {
    const nomeAparado = nome.trim();
    const vTotal = parseInt(totalParcelas, 10);
    if (!nomeAparado || !valorParcela || !vTotal) return;
    if (tipo === "cartao" && !cartaoId) return;
    const vPagas = pagas ? Math.min(parseInt(pagas, 10), vTotal) : 0;
    onEditar(parcela.id, {
      nome: nomeAparado,
      valorParcela,
      totalParcelas: vTotal,
      parcelasRestantes: Math.max(0, vTotal - vPagas),
      tipo,
      cartaoId: tipo === "cartao" ? cartaoId : undefined,
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
            💳 Cartão
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
            🏦 Financiamento
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
        {tipo === "cartao" && (
          <select
            value={cartaoId}
            onChange={(e) => setCartaoId(e.target.value)}
            className="w-full sm:w-64 rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
          >
            <option value="">Qual cartão?</option>
            {cartoes.map((c) => (
              <option key={c.id} value={c.id}>
                💳 {c.nome}
              </option>
            ))}
          </select>
        )}
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
