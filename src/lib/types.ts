export type TipoGanho = "recorrente" | "pontual";

export interface Ganho {
  id: string;
  tipo: TipoGanho;
  mes?: string; // "2026-07" — só existe quando tipo === "pontual"
  ativo?: boolean; // só relevante quando tipo === "recorrente"
  descricao: string;
  valor: number;
  criadoEm: number;
}

export interface ContaFixa {
  id: string;
  nome: string;
  valor: number;
  categoria: string;
  ativa: boolean;
  criadoEm: number;
}

export type TipoParcela = "cartao" | "financiamento";

export interface Parcela {
  id: string;
  tipo: TipoParcela;
  cartaoId?: string; // só existe quando tipo === "cartao"
  nome: string;
  valorParcela: number;
  totalParcelas: number;
  parcelasRestantes: number;
  dividida?: boolean; // você paga só metade do valorParcela (ex: dividido com outra pessoa)
  mesReferencia?: string; // mês em que "parcelasRestantes" é válido
  criadoEm: number;
}

export function valorMinhaParte(parcela: Parcela): number {
  return parcela.dividida ? parcela.valorParcela / 2 : parcela.valorParcela;
}

export interface Cartao {
  id: string;
  nome: string;
  criadoEm: number;
}

export interface Assinatura {
  id: string;
  nome: string;
  valor: number;
  cartaoId?: string;
  ativa: boolean;
  criadoEm: number;
}

export function mesAtual(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Nenhum mês antes deste fica visível no app, mesmo que o mês real seja anterior.
export const MES_MINIMO = "2026-08";

export function mesPadrao(): string {
  const atual = mesAtual();
  return atual > MES_MINIMO ? atual : MES_MINIMO;
}

export function diferencaMeses(de: string, para: string): number {
  const [anoDe, mesDe] = de.split("-").map(Number);
  const [anoPara, mesPara] = para.split("-").map(Number);
  return (anoPara - anoDe) * 12 + (mesPara - mesDe);
}

export function parcelasRestantesEm(parcela: Parcela, mes: string): number {
  const referencia = parcela.mesReferencia ?? mesPadrao();
  const decorridos = Math.max(0, diferencaMeses(referencia, mes));
  return Math.max(0, parcela.parcelasRestantes - decorridos);
}

export function formatarMes(mes: string): string {
  const [ano, m] = mes.split("-");
  const nomes = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return `${nomes[parseInt(m, 10) - 1]} de ${ano}`;
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Desconto padrão sobre tudo que é emitido (nota/recibo) — salário + comissões.
export const TAXA_IMPOSTO = 0.06;

export function calcularImposto(valorBruto: number): number {
  return valorBruto * TAXA_IMPOSTO;
}
