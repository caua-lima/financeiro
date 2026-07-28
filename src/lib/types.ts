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
  criadoEm: number;
}

export interface Cartao {
  id: string;
  nome: string;
  criadoEm: number;
}

export function mesAtual(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
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
