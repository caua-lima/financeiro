export const CARTOES_PREDEFINIDOS = [
  "Mercado Pago",
  "Santander CPF",
  "Santander CNPJ",
  "Nubank CPF",
  "Nubank CNPJ",
  "Inter",
] as const;

export type NomeCartao = (typeof CARTOES_PREDEFINIDOS)[number];
