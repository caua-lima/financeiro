"use client";

import { FormEvent, useState } from "react";
import { formatarMoeda, Cartao } from "@/lib/types";
import { useCartoes } from "@/lib/useCartoes";
import { useParcelas } from "@/lib/useParcelas";
import { ErroBanner } from "@/components/ErroBanner";

export default function CartoesPage() {
  const { cartoes, loading, erro, adicionar, editar, remover } =
    useCartoes();
  const { parcelas } = useParcelas();
  const [nome, setNome] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nomeAparado = nome.trim();
    if (!nomeAparado) return;
    setNome("");
    adicionar(nomeAparado).catch(console.error);
  }

  function faturaDoCartao(cartaoId: string) {
    return parcelas
      .filter(
        (p) =>
          p.tipo === "cartao" &&
          p.cartaoId === cartaoId &&
          p.parcelasRestantes > 0
      )
      .reduce((acc, p) => acc + p.valorParcela, 0);
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Cartões</h1>
      <ErroBanner mensagem={erro} />

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          placeholder="Nome do cartão (ex: Nubank)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[#04120e] hover:bg-brand-dark transition-colors"
        >
          Adicionar
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-text-faint">Carregando...</p>
      ) : cartoes.length === 0 ? (
        <p className="text-sm text-text-faint">
          Nenhum cartão cadastrado. Cadastre um cartão pra poder vincular
          parcelas a ele.
        </p>
      ) : (
        <ul className="space-y-2">
          {cartoes.map((c) => (
            <ItemCartao
              key={c.id}
              cartao={c}
              faturaAtual={faturaDoCartao(c.id)}
              onEditar={editar}
              onRemover={remover}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemCartao({
  cartao,
  faturaAtual,
  onEditar,
  onRemover,
}: {
  cartao: Cartao;
  faturaAtual: number;
  onEditar: (id: string, dados: { nome: string }) => void;
  onRemover: (id: string) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(cartao.nome);

  function salvar() {
    const nomeAparado = nome.trim();
    if (!nomeAparado) return;
    onEditar(cartao.id, { nome: nomeAparado });
    setEditando(false);
  }

  if (editando) {
    return (
      <li className="flex gap-2 rounded-xl border border-brand/40 bg-surface px-4 py-3">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="flex-1 rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
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
    <li className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3">
      <div className="flex items-center gap-3">
        <span>💳</span>
        <span className="text-sm">{cartao.nome}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-text-faint">Fatura atual</p>
          <p className="text-sm font-medium text-gold">
            {formatarMoeda(faturaAtual)}
          </p>
        </div>
        <button
          onClick={() => setEditando(true)}
          className="text-text-faint hover:text-brand text-sm"
          aria-label="Editar"
        >
          ✎
        </button>
        <button
          onClick={() => onRemover(cartao.id)}
          className="text-text-faint hover:text-negative text-sm"
          aria-label="Remover"
        >
          ✕
        </button>
      </div>
    </li>
  );
}
