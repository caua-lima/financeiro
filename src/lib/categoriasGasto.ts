export const CATEGORIAS_GASTO = [
  "Alimentação",
  "Transporte",
  "Casa",
  "Saúde",
  "Lazer",
  "Compras",
  "Outros",
] as const;

export const ICONE_CATEGORIA_GASTO: Record<string, string> = {
  Alimentação: "🍽️",
  Transporte: "🚗",
  Casa: "🏠",
  Saúde: "🩺",
  Lazer: "🎮",
  Compras: "🛍️",
  Outros: "🗂️",
};

export function iconeCategoriaGasto(categoria: string): string {
  return ICONE_CATEGORIA_GASTO[categoria] ?? "🗂️";
}

const REGRAS_CATEGORIA: [RegExp, string][] = [
  [
    /gasolina|combust[ií]vel|uber|99|onibus|ônibus|estacionamento|ped[aá]gio|metr[oô]|passagem/i,
    "Transporte",
  ],
  [
    /mercado|supermercado|ifood|restaurante|lanche|padaria|almo[cç]o|janta|caf[eé]|pizza|hamburguer|hambúrguer/i,
    "Alimentação",
  ],
  [
    /farm[aá]cia|rem[eé]dio|m[eé]dico|consulta|dentista|exame|academia/i,
    "Saúde",
  ],
  [/cinema|\bbar\b|balada|jogo|show|viagem|passeio|streaming|netflix/i, "Lazer"],
  [/roupa|loja|shopping|t[eê]nis|sapato|presente/i, "Compras"],
  [/aluguel|condom[ií]nio|\bluz\b|\bágua\b|\bagua\b|internet|gás|gas\b/i, "Casa"],
];

export function inferirCategoriaGasto(descricao: string): string {
  for (const [regex, categoria] of REGRAS_CATEGORIA) {
    if (regex.test(descricao)) return categoria;
  }
  return "Outros";
}
