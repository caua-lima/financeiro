"use client";

import { FormEvent, useState } from "react";
import { mesAtual, formatarMoeda, Ganho } from "@/lib/types";
import { useGanhos } from "@/lib/useGanhos";
import { MonthSelector } from "@/components/MonthSelector";
import { MoneyInput } from "@/components/MoneyInput";

type Tipo = "recorrente" | "pontual";

export default function GanhosPage() {
  const [mes, setMes] = useState(mesAtual());
  const {
    recorrentes,
    pontuais,
    loading,
    total,
    adicionarRecorrente,
    adicionarPontual,
    editar,
    remover,
    alternarAtivo,
  } = useGanhos(mes);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState(0);
  const [tipo, setTipo] = useState<Tipo>("pontual");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const desc = descricao.trim();
    if (!desc || !valor) return;
    setDescricao("");
    setValor(0);
    if (tipo === "recorrente") {
      adicionarRecorrente(desc, valor).catch(console.error);
    } else {
      adicionarPontual(desc, valor).catch(console.error);
    }
  }

  return (
    <div>
      <MonthSelector mes={mes} onChange={setMes} />

      <form onSubmit={handleSubmit} className="space-y-2 mb-6">
        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            placeholder="Descrição (ex: Salário, Comissão)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <MoneyInput
            value={valor}
            onChange={setValor}
            className="w-full sm:w-36 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[#04120e] hover:bg-brand-dark transition-colors"
          >
            Adicionar
          </button>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setTipo("pontual")}
            className={`rounded-full px-3 py-1 border transition-colors ${
              tipo === "pontual"
                ? "border-brand bg-brand-soft text-brand"
                : "border-line text-text-faint"
            }`}
          >
            Só este mês
          </button>
          <button
            type="button"
            onClick={() => setTipo("recorrente")}
            className={`rounded-full px-3 py-1 border transition-colors ${
              tipo === "recorrente"
                ? "border-brand bg-brand-soft text-brand"
                : "border-line text-text-faint"
            }`}
          >
            Recorrente (todo mês)
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-line bg-surface p-4 mb-4 flex justify-between items-center">
        <span className="text-sm text-text-muted">Total do mês</span>
        <span className="text-lg font-semibold text-positive">
          {formatarMoeda(total)}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-text-faint">Carregando...</p>
      ) : (
        <div className="space-y-6">
          <Secao
            titulo="Recorrentes (todo mês)"
            vazio="Nenhum ganho recorrente cadastrado."
            itens={recorrentes}
            comAtivo
            onEditar={editar}
            onRemover={remover}
            onAlternarAtivo={alternarAtivo}
          />
          <Secao
            titulo="Só este mês"
            vazio="Nenhum ganho avulso neste mês."
            itens={pontuais}
            onEditar={editar}
            onRemover={remover}
          />
        </div>
      )}
    </div>
  );
}

function Secao({
  titulo,
  vazio,
  itens,
  comAtivo,
  onEditar,
  onRemover,
  onAlternarAtivo,
}: {
  titulo: string;
  vazio: string;
  itens: Ganho[];
  comAtivo?: boolean;
  onEditar: (id: string, dados: { descricao: string; valor: number }) => void;
  onRemover: (id: string) => void;
  onAlternarAtivo?: (id: string, ativo: boolean) => void;
}) {
  return (
    <div>
      <h2 className="text-sm font-medium text-text-muted mb-2">{titulo}</h2>
      {itens.length === 0 ? (
        <p className="text-sm text-text-faint">{vazio}</p>
      ) : (
        <ul className="space-y-2">
          {itens.map((g) => (
            <ItemGanho
              key={g.id}
              ganho={g}
              comAtivo={comAtivo}
              onEditar={onEditar}
              onRemover={onRemover}
              onAlternarAtivo={onAlternarAtivo}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemGanho({
  ganho,
  comAtivo,
  onEditar,
  onRemover,
  onAlternarAtivo,
}: {
  ganho: Ganho;
  comAtivo?: boolean;
  onEditar: (id: string, dados: { descricao: string; valor: number }) => void;
  onRemover: (id: string) => void;
  onAlternarAtivo?: (id: string, ativo: boolean) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [descricao, setDescricao] = useState(ganho.descricao);
  const [valor, setValor] = useState(ganho.valor);

  function salvar() {
    const desc = descricao.trim();
    if (!desc || !valor) return;
    onEditar(ganho.id, { descricao: desc, valor });
    setEditando(false);
  }

  if (editando) {
    return (
      <li className="flex flex-col sm:flex-row gap-2 rounded-xl border border-brand/40 bg-surface px-4 py-3">
        <input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
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
      className={`flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 ${
        comAtivo && ganho.ativo === false ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {comAtivo && onAlternarAtivo && (
          <input
            type="checkbox"
            checked={ganho.ativo !== false}
            onChange={(e) => onAlternarAtivo(ganho.id, e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
        )}
        <span className="text-sm">{ganho.descricao}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-positive">
          {formatarMoeda(ganho.valor)}
        </span>
        <button
          onClick={() => setEditando(true)}
          className="text-text-faint hover:text-brand text-sm"
          aria-label="Editar"
        >
          ✎
        </button>
        <button
          onClick={() => onRemover(ganho.id)}
          className="text-text-faint hover:text-negative text-sm"
          aria-label="Remover"
        >
          ✕
        </button>
      </div>
    </li>
  );
}
