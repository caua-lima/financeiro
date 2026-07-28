"use client";

import { FormEvent, useMemo, useState } from "react";
import { formatarMoeda, ContaBancaria } from "@/lib/types";
import { useContasBancarias } from "@/lib/useContasBancarias";
import { useGastos } from "@/lib/useGastos";
import { MoneyInput } from "@/components/MoneyInput";
import { ErroBanner } from "@/components/ErroBanner";

export default function SaldoPage() {
  const { contas, loading, erro, adicionar, editar, remover } =
    useContasBancarias();
  const { gastos } = useGastos();

  const [nome, setNome] = useState("");
  const [saldoInicial, setSaldoInicial] = useState(0);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nomeAparado = nome.trim();
    if (!nomeAparado) return;
    setNome("");
    setSaldoInicial(0);
    adicionar(nomeAparado, saldoInicial).catch(console.error);
  }

  const gastoPorConta = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const g of gastos) {
      if (g.formaPagamento !== "pix" || !g.contaBancariaId) continue;
      mapa.set(
        g.contaBancariaId,
        (mapa.get(g.contaBancariaId) ?? 0) + g.valor
      );
    }
    return mapa;
  }, [gastos]);

  const totalSaldo = contas.reduce(
    (acc, c) => acc + (c.saldoInicial - (gastoPorConta.get(c.id) ?? 0)),
    0
  );

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Saldo em conta</h1>
      <ErroBanner mensagem={erro} />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-line bg-surface p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-2"
      >
        <input
          placeholder="Nome (ex: Mercado Pago)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <MoneyInput
          value={saldoInicial}
          onChange={setSaldoInicial}
          placeholder="Saldo inicial"
          className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[#04120e] hover:bg-brand-dark transition-colors"
        >
          Adicionar
        </button>
      </form>

      <div className="rounded-2xl border border-line bg-surface p-4 mb-6 flex justify-between items-center">
        <span className="text-sm text-text-muted">Saldo total</span>
        <span className="text-lg font-semibold text-positive">
          {formatarMoeda(totalSaldo)}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-text-faint">Carregando...</p>
      ) : contas.length === 0 ? (
        <p className="text-sm text-text-faint">
          Nenhuma conta cadastrada. Cadastre pra registrar gastos no pix e
          acompanhar o saldo.
        </p>
      ) : (
        <ul className="space-y-2">
          {contas.map((c) => (
            <ItemConta
              key={c.id}
              conta={c}
              gasto={gastoPorConta.get(c.id) ?? 0}
              onEditar={editar}
              onRemover={remover}
            />
          ))}
        </ul>
      )}

      <p className="text-xs text-text-faint mt-4">
        O saldo desconta automaticamente os gastos registrados no pix — vá
        em{" "}
        <a href="/gastos" className="text-brand hover:text-brand-dark">
          Gastos
        </a>{" "}
        pra registrar.
      </p>
    </div>
  );
}

function ItemConta({
  conta,
  gasto,
  onEditar,
  onRemover,
}: {
  conta: ContaBancaria;
  gasto: number;
  onEditar: (id: string, dados: { nome: string; saldoInicial: number }) => void;
  onRemover: (id: string) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(conta.nome);
  const [saldoInicial, setSaldoInicial] = useState(conta.saldoInicial);

  const saldoAtual = conta.saldoInicial - gasto;

  function salvar() {
    const nomeAparado = nome.trim();
    if (!nomeAparado) return;
    onEditar(conta.id, { nome: nomeAparado, saldoInicial });
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
          value={saldoInicial}
          onChange={setSaldoInicial}
          className="w-full sm:w-36 rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
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
      <span className="text-sm">{conta.nome}</span>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-text-faint">Saldo atual</p>
          <p
            className={`text-sm font-medium ${
              saldoAtual >= 0 ? "text-positive" : "text-negative"
            }`}
          >
            {formatarMoeda(saldoAtual)}
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
