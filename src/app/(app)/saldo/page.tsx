"use client";

import { FormEvent, useMemo, useState } from "react";
import { formatarMoeda, mesPadrao, Gasto } from "@/lib/types";
import {
  CATEGORIAS_GASTO,
  iconeCategoriaGasto,
  inferirCategoriaGasto,
} from "@/lib/categoriasGasto";
import { parseGastoTexto } from "@/lib/parseGastoTexto";
import { useSaldo } from "@/lib/useSaldo";
import { useGastos } from "@/lib/useGastos";
import { MoneyInput } from "@/components/MoneyInput";
import { ErroBanner } from "@/components/ErroBanner";

function agruparPorCategoria(gastos: Gasto[]) {
  const grupos = new Map<string, Gasto[]>();
  for (const g of gastos) {
    const lista = grupos.get(g.categoria) ?? [];
    lista.push(g);
    grupos.set(g.categoria, lista);
  }
  const ordem = CATEGORIAS_GASTO as readonly string[];
  return [...grupos.entries()].sort(
    (a, b) => ordem.indexOf(a[0]) - ordem.indexOf(b[0])
  );
}

export default function SaldoPage() {
  const { saldo, loading: loadingSaldo, erro: erroSaldo, definir } = useSaldo();
  const {
    gastos,
    loading: loadingGastos,
    erro: erroGastos,
    adicionar,
    editar,
    remover,
  } = useGastos();

  const [texto, setTexto] = useState("");
  const [ultimoRegistro, setUltimoRegistro] = useState<string | null>(null);
  const [avisoParcial, setAvisoParcial] = useState<string | null>(null);
  const [editandoSaldo, setEditandoSaldo] = useState(false);
  const [novoSaldo, setNovoSaldo] = useState(0);

  const mes = mesPadrao();
  const loading = loadingSaldo || loadingGastos;
  const erro = erroSaldo || erroGastos;

  const gastosDoMes = useMemo(
    () => gastos.filter((g) => g.mes === mes),
    [gastos, mes]
  );
  const totalDoMes = gastosDoMes.reduce((acc, g) => acc + g.valor, 0);
  const grupos = useMemo(() => agruparPorCategoria(gastosDoMes), [gastosDoMes]);

  const gastosDesdeReferencia = saldo
    ? gastos.filter((g) => g.criadoEm > saldo.atualizadoEm)
    : [];
  const saldoAtual = saldo
    ? saldo.valor - gastosDesdeReferencia.reduce((acc, g) => acc + g.valor, 0)
    : null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const frase = texto.trim();
    if (!frase) return;

    const interpretado = parseGastoTexto(frase);
    if (!interpretado.valor || !interpretado.descricao) {
      setAvisoParcial(
        'Não consegui entender direito. Tenta algo como "Gastei 100 reais de gasolina".'
      );
      setUltimoRegistro(null);
      return;
    }

    const categoria = inferirCategoriaGasto(interpretado.descricao);
    setTexto("");
    setAvisoParcial(null);
    adicionar(interpretado.descricao, interpretado.valor, categoria).catch(
      console.error
    );
    setUltimoRegistro(
      `${formatarMoeda(interpretado.valor)} · ${interpretado.descricao} · ${iconeCategoriaGasto(categoria)} ${categoria}`
    );
  }

  function abrirEdicaoSaldo() {
    setNovoSaldo(saldoAtual ?? 0);
    setEditandoSaldo(true);
  }

  function salvarSaldo() {
    definir(novoSaldo);
    setEditandoSaldo(false);
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-1">Saldo e gastos</h1>
      <p className="text-xs text-text-faint mb-4">
        Mercado Pago · fale o que você gastou e o saldo já desconta sozinho
      </p>
      <ErroBanner mensagem={erro} />

      {/* SALDO */}
      <div className="rounded-2xl border border-brand/25 bg-surface-elevated p-6 mb-6 text-center">
        <p className="text-sm text-text-muted">Saldo atual</p>
        {editandoSaldo ? (
          <div className="flex items-center justify-center gap-2 mt-2">
            <MoneyInput
              value={novoSaldo}
              onChange={setNovoSaldo}
              className="w-40 rounded-lg border border-line bg-surface-2 px-3 py-2 text-lg text-center outline-none focus:border-brand"
            />
            <button
              onClick={salvarSaldo}
              className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-[#0E0F0C] hover:bg-brand-dark transition-colors"
            >
              Salvar
            </button>
            <button
              onClick={() => setEditandoSaldo(false)}
              className="rounded-lg border border-line px-3 py-2 text-sm text-text-muted"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <>
            <p
              className={`text-3xl font-bold mt-1 ${
                saldoAtual === null
                  ? "text-text-faint"
                  : saldoAtual >= 0
                  ? "text-brand"
                  : "text-negative"
              }`}
            >
              {saldoAtual === null ? "não definido" : formatarMoeda(saldoAtual)}
            </p>
            <button
              onClick={abrirEdicaoSaldo}
              className="mt-3 text-xs text-text-muted hover:text-brand"
            >
              {saldoAtual === null ? "Definir saldo" : "Atualizar saldo"}
            </button>
          </>
        )}
      </div>

      {/* REGISTRO RÁPIDO */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-line bg-surface p-4 mb-3"
      >
        <div className="flex gap-2">
          <input
            placeholder='Ex: "Gastei 100 reais de gasolina"'
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="flex-1 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[#0E0F0C] hover:bg-brand-dark transition-colors"
          >
            Registrar
          </button>
        </div>
      </form>

      {ultimoRegistro && (
        <div className="mb-4 rounded-xl border border-brand/30 bg-brand-soft px-4 py-3 text-sm text-brand">
          Registrado: {ultimoRegistro}
        </div>
      )}
      {avisoParcial && (
        <div className="mb-4 rounded-xl border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-gold">
          {avisoParcial}
        </div>
      )}

      <div className="rounded-2xl border border-line bg-surface p-4 mb-6 flex justify-between items-center">
        <span className="text-sm text-text-muted">Total gasto no mês</span>
        <span className="text-lg font-semibold text-gold">
          {formatarMoeda(totalDoMes)}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-text-faint">Carregando...</p>
      ) : gastosDoMes.length === 0 ? (
        <p className="text-sm text-text-faint">
          Nenhum gasto registrado neste mês.
        </p>
      ) : (
        <div className="space-y-5">
          {grupos.map(([categoria, itens]) => (
            <div key={categoria}>
              <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-sm font-medium text-text-muted">
                  {iconeCategoriaGasto(categoria)} {categoria}
                </h2>
                <span className="text-xs text-text-faint">
                  {formatarMoeda(itens.reduce((acc, g) => acc + g.valor, 0))}
                </span>
              </div>
              <ul className="space-y-2">
                {itens.map((g) => (
                  <ItemGasto
                    key={g.id}
                    gasto={g}
                    onEditar={editar}
                    onRemover={remover}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemGasto({
  gasto,
  onEditar,
  onRemover,
}: {
  gasto: Gasto;
  onEditar: (
    id: string,
    dados: { descricao: string; valor: number; categoria: string }
  ) => void;
  onRemover: (id: string) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [descricao, setDescricao] = useState(gasto.descricao);
  const [valor, setValor] = useState(gasto.valor);
  const [categoria, setCategoria] = useState(gasto.categoria);

  function salvar() {
    const descAparada = descricao.trim();
    if (!descAparada || !valor) return;
    onEditar(gasto.id, { descricao: descAparada, valor, categoria });
    setEditando(false);
  }

  if (editando) {
    return (
      <li className="rounded-xl border border-brand/40 bg-surface px-4 py-3 space-y-2">
        <input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
        />
        <div className="grid grid-cols-2 gap-2">
          <MoneyInput
            value={valor}
            onChange={setValor}
            className="rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
          >
            {CATEGORIAS_GASTO.map((c) => (
              <option key={c} value={c}>
                {iconeCategoriaGasto(c)} {c}
              </option>
            ))}
          </select>
        </div>
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
    <li className="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface px-4 py-3">
      <span className="text-sm truncate">{gasto.descricao}</span>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-medium text-gold">
          {formatarMoeda(gasto.valor)}
        </span>
        <button
          onClick={() => setEditando(true)}
          className="text-text-faint hover:text-brand text-sm"
          aria-label="Editar"
        >
          ✎
        </button>
        <button
          onClick={() => onRemover(gasto.id)}
          className="text-text-faint hover:text-negative text-sm"
          aria-label="Remover"
        >
          ✕
        </button>
      </div>
    </li>
  );
}
