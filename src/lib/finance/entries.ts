import { FinancialEntry } from "@/lib/types";
import { isEntryActive, isEntryPending } from "./calculations";

/**
 * Helpers de manipulação de listas de FinancialEntry — ordenação,
 * agrupamento e filtros usados pela Home e pela Agenda.
 */

export function sortByDueDate(entries: FinancialEntry[]): FinancialEntry[] {
  return [...entries].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function filterPendentesAtivos(entries: FinancialEntry[]): FinancialEntry[] {
  return entries.filter((e) => isEntryActive(e) && isEntryPending(e));
}

export interface GrupoPorCategoria {
  categoryId: string;
  total: number;
  itens: FinancialEntry[];
}

export function groupByCategory(entries: FinancialEntry[]): GrupoPorCategoria[] {
  const mapa = new Map<string, FinancialEntry[]>();
  for (const e of entries) {
    const lista = mapa.get(e.categoryId) ?? [];
    lista.push(e);
    mapa.set(e.categoryId, lista);
  }
  return [...mapa.entries()]
    .map(([categoryId, itens]) => ({
      categoryId,
      total: itens.reduce((acc, e) => acc + e.amount, 0),
      itens,
    }))
    .sort((a, b) => b.total - a.total);
}

export type FaixaUrgencia =
  | "atrasados"
  | "hoje"
  | "amanha"
  | "estaSemana"
  | "proximaSemana"
  | "maisAdiante";

const ORDEM_FAIXAS: FaixaUrgencia[] = [
  "atrasados",
  "hoje",
  "amanha",
  "estaSemana",
  "proximaSemana",
  "maisAdiante",
];

const LABEL_FAIXA: Record<FaixaUrgencia, string> = {
  atrasados: "Atrasados",
  hoje: "Hoje",
  amanha: "Amanhã",
  estaSemana: "Esta semana",
  proximaSemana: "Próxima semana",
  maisAdiante: "Mais adiante",
};

function faixaDoDia(dueDate: string, hojeISO: string): FaixaUrgencia {
  const hoje = new Date(hojeISO);
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(dueDate);
  data.setHours(0, 0, 0, 0);
  const diffDias = Math.round((data.getTime() - hoje.getTime()) / 86400000);

  if (diffDias < 0) return "atrasados";
  if (diffDias === 0) return "hoje";
  if (diffDias === 1) return "amanha";
  if (diffDias <= 7) return "estaSemana";
  if (diffDias <= 14) return "proximaSemana";
  return "maisAdiante";
}

export interface GrupoPorUrgencia {
  faixa: FaixaUrgencia;
  label: string;
  itens: FinancialEntry[];
}

export function groupByUrgency(
  entries: FinancialEntry[],
  hojeISO: string
): GrupoPorUrgencia[] {
  const mapa = new Map<FaixaUrgencia, FinancialEntry[]>();
  for (const e of sortByDueDate(entries)) {
    const faixa = faixaDoDia(e.dueDate, hojeISO);
    const lista = mapa.get(faixa) ?? [];
    lista.push(e);
    mapa.set(faixa, lista);
  }
  return ORDEM_FAIXAS.filter((f) => mapa.has(f)).map((faixa) => ({
    faixa,
    label: LABEL_FAIXA[faixa],
    itens: mapa.get(faixa)!,
  }));
}
