import { FormaPagamento } from "./types";

export interface GastoInterpretado {
  valor: number | null;
  descricao: string;
  formaPagamento: FormaPagamento | null;
  nomeAlvo: string; // nome do cartão/conta citado na frase, pra tentar casar com o cadastro
}

const CONECTORES =
  /^(com|em|no|na|nos|nas|de|do|da|num|numa|pra|para|pelo|pela|via|e)$/i;

function limparBordas(txt: string): string {
  const partes = txt.trim().split(/\s+/).filter(Boolean);
  while (partes.length && CONECTORES.test(partes[0])) partes.shift();
  while (partes.length && CONECTORES.test(partes[partes.length - 1]))
    partes.pop();
  return partes.join(" ");
}

export function parseGasto(textoOriginal: string): GastoInterpretado {
  const texto = textoOriginal.trim();

  let valor: number | null = null;
  let mValor = texto.match(/r\$\s*([\d.,]+)/i);
  if (!mValor) mValor = texto.match(/([\d.,]+)\s*(reais?|conto|contos)\b/i);
  if (mValor) {
    valor = parseFloat(mValor[1].replace(/\.(?=\d{3}\b)/, "").replace(",", "."));
  }

  let formaPagamento: FormaPagamento | null = null;
  let nomeAlvo = "";
  let inicioClausula = texto.length;

  const mCartao = texto.match(
    /\b(?:no|com|pelo|via)?\s*cart[aã]o\s+([^,.;]+)/i
  );
  const mPix = texto.match(/\b(?:no|pelo|via)?\s*pix\b[\s,:-]*([^,.;]*)/i);
  const mDinheiro = texto.match(/\b(dinheiro|esp[eé]cie)\b/i);

  if (mCartao) {
    formaPagamento = "cartao";
    nomeAlvo = mCartao[1].trim();
    inicioClausula = mCartao.index ?? texto.length;
  } else if (mPix) {
    formaPagamento = "pix";
    nomeAlvo = mPix[1].trim();
    inicioClausula = mPix.index ?? texto.length;
  } else if (mDinheiro) {
    formaPagamento = "dinheiro";
    inicioClausula = mDinheiro.index ?? texto.length;
  }

  let antes = texto.slice(0, inicioClausula);
  antes = antes
    .replace(/^(gastei|paguei|comprei|gasto de)\s*/i, "")
    .trim();
  antes = antes.replace(/r\$\s*[\d.,]+\s*/i, "").trim();
  antes = antes.replace(/[\d.,]+\s*(reais?|conto|contos)?\s*/i, "").trim();
  const descricao = limparBordas(antes);

  return { valor, descricao, formaPagamento, nomeAlvo };
}

export function encontrarPorNome<T extends { nome: string }>(
  itens: T[],
  nomeAlvo: string
): T | undefined {
  if (!nomeAlvo) return undefined;
  const alvo = nomeAlvo.toLowerCase();
  return (
    itens.find((i) => i.nome.toLowerCase() === alvo) ??
    itens.find(
      (i) =>
        i.nome.toLowerCase().includes(alvo) ||
        alvo.includes(i.nome.toLowerCase())
    )
  );
}
