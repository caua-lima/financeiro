"use client";

import { useMemo, useState } from "react";
import {
  mesPadrao,
  formatarMoeda,
  parcelasRestantesEm,
  valorMinhaParte,
  TAXA_IMPOSTO,
  Ganho,
  ContaFixa,
  Assinatura,
  Parcela,
  FaturaCartao,
} from "@/lib/types";
import { iconeCategoria, CATEGORIAS_CONTAS } from "@/lib/categorias";
import { useGanhos } from "@/lib/useGanhos";
import { useContasFixas } from "@/lib/useContasFixas";
import { useAssinaturas } from "@/lib/useAssinaturas";
import { useParcelas } from "@/lib/useParcelas";
import { useFaturasCartao } from "@/lib/useFaturasCartao";
import { MonthSelector } from "@/components/MonthSelector";
import { ErroBanner } from "@/components/ErroBanner";

function agruparPorChave<T>(itens: T[], chave: (item: T) => string) {
  const grupos = new Map<string, T[]>();
  for (const item of itens) {
    const k = chave(item);
    const lista = grupos.get(k) ?? [];
    lista.push(item);
    grupos.set(k, lista);
  }
  return grupos;
}

export default function DrePage() {
  const [mes, setMes] = useState(mesPadrao());
  const ganhos = useGanhos(mes);
  const contas = useContasFixas();
  const assinaturas = useAssinaturas();
  const parcelas = useParcelas();
  const faturas = useFaturasCartao(mes);

  const loading =
    ganhos.loading ||
    contas.loading ||
    assinaturas.loading ||
    parcelas.loading ||
    faturas.loading;
  const erro =
    ganhos.erro ||
    contas.erro ||
    assinaturas.erro ||
    parcelas.erro ||
    faturas.erro;

  const contasPorCategoria = useMemo(() => {
    const grupos = agruparPorChave(contas.contas, (c) => c.categoria);
    const ordem = CATEGORIAS_CONTAS as readonly string[];
    return [...grupos.entries()].sort((a, b) => {
      const ia = ordem.indexOf(a[0]);
      const ib = ordem.indexOf(b[0]);
      if (ia === -1 && ib === -1) return a[0].localeCompare(b[0]);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [contas.contas]);

  const parcelasDoMes = useMemo(
    () => parcelas.parcelas.filter((p) => parcelasRestantesEm(p, mes) > 0),
    [parcelas.parcelas, mes]
  );

  const parcelasPorGrupo = useMemo(
    () =>
      agruparPorChave(parcelasDoMes, (p) =>
        p.tipo === "financiamento" ? "Financiamento" : "Cartão de crédito"
      ),
    [parcelasDoMes]
  );

  const totalContas = contas.total;
  const totalAssinaturas = assinaturas.total;
  const totalParcelas = parcelasDoMes.reduce(
    (acc, p) => (p.naFatura ? acc : acc + valorMinhaParte(p)),
    0
  );
  const totalFaturas = faturas.total;
  const totalDespesas =
    totalContas + totalAssinaturas + totalParcelas + totalFaturas;
  const resultado = ganhos.totalLiquido - totalDespesas;

  return (
    <div>
      <h1 className="text-lg font-semibold mb-1">DRE do mês</h1>
      <p className="text-xs text-text-faint mb-4">
        Demonstrativo detalhado de receitas e despesas
      </p>
      <MonthSelector mes={mes} onChange={setMes} />
      <ErroBanner mensagem={erro} />

      {loading ? (
        <p className="text-sm text-text-faint">Carregando...</p>
      ) : (
        <div className="space-y-5">
          <div
            className={`rounded-2xl border p-6 text-center ${
              resultado >= 0
                ? "border-brand/25 bg-positive-soft"
                : "border-negative/40 bg-negative-soft"
            }`}
          >
            <p className="text-sm text-text-muted">Resultado do mês</p>
            <p
              className={`text-3xl font-bold mt-1 ${
                resultado >= 0 ? "text-positive" : "text-negative"
              }`}
            >
              {formatarMoeda(resultado)}
            </p>
          </div>

          {/* RECEITAS */}
          <Secao titulo="Receitas" total={ganhos.total} corTotal="text-positive">
            <SubGrupo titulo="Recorrentes">
              {ganhos.recorrentes.length === 0 ? (
                <Vazio />
              ) : (
                ganhos.recorrentes.map((g: Ganho) => (
                  <ItemLinha
                    key={g.id}
                    nome={g.descricao}
                    valor={g.valor}
                    cor="text-positive"
                    inativo={g.ativo === false}
                    nota={g.ativo === false ? "desativado" : undefined}
                  />
                ))
              )}
            </SubGrupo>
            <SubGrupo titulo="Só este mês">
              {ganhos.pontuais.length === 0 ? (
                <Vazio />
              ) : (
                ganhos.pontuais.map((g: Ganho) => (
                  <ItemLinha
                    key={g.id}
                    nome={g.descricao}
                    valor={g.valor}
                    cor="text-positive"
                  />
                ))
              )}
            </SubGrupo>
            <TotalLinha label="Receita bruta" valor={ganhos.total} />
            <TotalLinha
              label={`(−) Imposto (${(TAXA_IMPOSTO * 100).toFixed(0)}%)`}
              valor={ganhos.imposto}
              cor="text-negative"
            />
            <TotalLinha
              label="= Receita líquida"
              valor={ganhos.totalLiquido}
              cor="text-positive"
              destaque
            />
          </Secao>

          {/* CONTAS FIXAS */}
          <Secao titulo="Contas fixas" total={totalContas} corTotal="text-gold">
            {contasPorCategoria.map(([categoria, itens]) => (
              <SubGrupo
                key={categoria}
                titulo={`${iconeCategoria(categoria)} ${categoria}`}
                subtotal={itens
                  .filter((c) => c.ativa)
                  .reduce((acc, c) => acc + c.valor, 0)}
              >
                {itens.map((c: ContaFixa) => (
                  <ItemLinha
                    key={c.id}
                    nome={c.nome}
                    valor={c.valor}
                    cor="text-gold"
                    inativo={!c.ativa}
                    nota={!c.ativa ? "desativada" : undefined}
                  />
                ))}
              </SubGrupo>
            ))}
          </Secao>

          {/* ASSINATURAS */}
          <Secao titulo="Assinaturas" total={totalAssinaturas} corTotal="text-gold">
            {assinaturas.assinaturas.length === 0 ? (
              <Vazio />
            ) : (
              assinaturas.assinaturas.map((a: Assinatura) => (
                <ItemLinha
                  key={a.id}
                  nome={a.nome}
                  valor={a.valor}
                  cor="text-gold"
                  inativo={!a.ativa || a.naFatura}
                  nota={
                    !a.ativa
                      ? "desativada"
                      : a.naFatura
                      ? "já contada na fatura do cartão"
                      : undefined
                  }
                />
              ))
            )}
          </Secao>

          {/* PARCELAS E FINANCIAMENTOS */}
          <Secao
            titulo="Parcelas e financiamentos"
            total={totalParcelas}
            corTotal="text-gold"
          >
            {[...parcelasPorGrupo.entries()].map(([grupo, itens]) => (
              <SubGrupo
                key={grupo}
                titulo={grupo}
                subtotal={itens.reduce(
                  (acc, p) => (p.naFatura ? acc : acc + valorMinhaParte(p)),
                  0
                )}
              >
                {itens.map((p: Parcela) => (
                  <ItemLinha
                    key={p.id}
                    nome={p.nome}
                    valor={valorMinhaParte(p)}
                    cor="text-gold"
                    inativo={p.naFatura}
                    nota={
                      p.naFatura
                        ? `já contada na fatura do cartão · faltam ${p.parcelasRestantes}`
                        : p.dividida
                        ? `dividida · total ${formatarMoeda(p.valorParcela)} · faltam ${p.parcelasRestantes}`
                        : `faltam ${p.parcelasRestantes} de ${p.totalParcelas}`
                    }
                  />
                ))}
              </SubGrupo>
            ))}
          </Secao>

          {/* FATURA DO CARTÃO */}
          <Secao
            titulo="Fatura do cartão"
            total={totalFaturas}
            corTotal="text-gold"
          >
            {faturas.faturas.filter((f) => f.valor > 0).length === 0 ? (
              <Vazio />
            ) : (
              faturas.faturas
                .filter((f: FaturaCartao) => f.valor > 0)
                .map((f: FaturaCartao) => (
                  <ItemLinha
                    key={f.id}
                    nome={f.nome}
                    valor={f.valor}
                    cor="text-gold"
                  />
                ))
            )}
          </Secao>

          {/* RESUMO FINAL */}
          <div className="rounded-2xl border border-line bg-surface p-4">
            <h2 className="text-sm font-medium text-text-muted mb-3">
              Resumo do DRE
            </h2>
            <div className="space-y-2 text-sm">
              <LinhaResumo label="Receita líquida" valor={ganhos.totalLiquido} sinal="+" />
              <LinhaResumo label="Contas fixas" valor={totalContas} sinal="-" />
              <LinhaResumo label="Assinaturas" valor={totalAssinaturas} sinal="-" />
              <LinhaResumo label="Parcelas e financiamentos" valor={totalParcelas} sinal="-" />
              <LinhaResumo label="Fatura do cartão" valor={totalFaturas} sinal="-" />
              <div className="border-t border-line pt-2 flex justify-between font-semibold">
                <span>Resultado do mês</span>
                <span className={resultado >= 0 ? "text-positive" : "text-negative"}>
                  {formatarMoeda(resultado)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Secao({
  titulo,
  total,
  corTotal,
  children,
}: {
  titulo: string;
  total: number;
  corTotal: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">{titulo}</h2>
        <span className={`text-sm font-semibold ${corTotal}`}>
          {formatarMoeda(total)}
        </span>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SubGrupo({
  titulo,
  subtotal,
  children,
}: {
  titulo: string;
  subtotal?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide">
          {titulo}
        </h3>
        {subtotal !== undefined && (
          <span className="text-xs text-text-faint">
            {formatarMoeda(subtotal)}
          </span>
        )}
      </div>
      <div className="space-y-1 pl-2 border-l border-line-soft">
        {children}
      </div>
    </div>
  );
}

function ItemLinha({
  nome,
  valor,
  cor,
  inativo,
  nota,
}: {
  nome: string;
  valor: number;
  cor: string;
  inativo?: boolean;
  nota?: string;
}) {
  return (
    <div
      className={`flex justify-between items-center pl-2 text-sm ${
        inativo ? "opacity-50" : ""
      }`}
    >
      <div className="min-w-0">
        <p className="truncate">{nome}</p>
        {nota && <p className="text-xs text-text-faint">{nota}</p>}
      </div>
      <span className={`shrink-0 ml-3 ${cor}`}>{formatarMoeda(valor)}</span>
    </div>
  );
}

function Vazio() {
  return <p className="pl-2 text-xs text-text-faint">Nenhum item.</p>;
}

function TotalLinha({
  label,
  valor,
  cor,
  destaque,
}: {
  label: string;
  valor: number;
  cor?: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center text-sm ${
        destaque ? "border-t border-line pt-2 font-semibold" : "text-text-muted"
      }`}
    >
      <span>{label}</span>
      <span className={cor ?? "text-text"}>{formatarMoeda(valor)}</span>
    </div>
  );
}

function LinhaResumo({
  label,
  valor,
  sinal,
}: {
  label: string;
  valor: number;
  sinal: "+" | "-";
}) {
  return (
    <div className="flex justify-between text-text-muted">
      <span>{label}</span>
      <span className={sinal === "+" ? "text-positive" : "text-gold"}>
        {sinal} {formatarMoeda(valor)}
      </span>
    </div>
  );
}
