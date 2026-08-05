const CONECTORES = /^(de|do|da|com|em|no|na|num|numa|pra|para)$/i;

function limparBordas(txt: string): string {
  const partes = txt.trim().split(/\s+/).filter(Boolean);
  while (partes.length && CONECTORES.test(partes[0])) partes.shift();
  while (partes.length && CONECTORES.test(partes[partes.length - 1]))
    partes.pop();
  return partes.join(" ");
}

export interface GastoTextoInterpretado {
  valor: number | null;
  descricao: string;
}

export function parseGastoTexto(textoOriginal: string): GastoTextoInterpretado {
  const texto = textoOriginal.trim();

  let valor: number | null = null;
  let mValor = texto.match(/r\$\s*([\d.,]+)/i);
  if (!mValor) mValor = texto.match(/([\d.,]+)\s*(reais?|conto|contos)\b/i);
  if (!mValor) {
    mValor = texto.match(
      /^(?:gastei|paguei|comprei|gasto de)\s+([\d.,]+)\b/i
    );
  }
  if (mValor) {
    valor = parseFloat(
      mValor[1].replace(/\.(?=\d{3}\b)/, "").replace(",", ".")
    );
  }

  let resto = texto
    .replace(/^(gastei|paguei|comprei|gasto de)\s*/i, "")
    .trim();
  resto = resto.replace(/r\$\s*[\d.,]+\s*/i, "").trim();
  resto = resto.replace(/[\d.,]+\s*(reais?|conto|contos)?\s*/i, "").trim();

  return { valor, descricao: limparBordas(resto) };
}
