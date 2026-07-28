export const CATEGORIAS_CONTAS = [
  "Moradia",
  "Internet",
  "Telefone",
  "Streaming",
  "Cartão de crédito",
  "Transporte",
  "Educação",
  "Saúde",
  "Academia",
  "Seguro",
  "Lazer",
  "Outros",
] as const;

export const ICONE_CATEGORIA: Record<string, string> = {
  Moradia: "🏠",
  Internet: "🌐",
  Telefone: "📱",
  Streaming: "🎬",
  "Cartão de crédito": "💳",
  Transporte: "🚗",
  Educação: "🎓",
  Saúde: "🩺",
  Academia: "🏋️",
  Seguro: "🛡️",
  Lazer: "🎮",
  Outros: "🗂️",
};

export function iconeCategoria(categoria: string): string {
  return ICONE_CATEGORIA[categoria] ?? "🗂️";
}
