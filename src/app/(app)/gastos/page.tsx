"use client";

import { FormEvent, useRef, useState } from "react";
import {
  formatarMoeda,
  mesPadrao,
  Gasto,
  FormaPagamento,
} from "@/lib/types";
import { parseGasto, encontrarPorNome } from "@/lib/parseGasto";
import { useGastos } from "@/lib/useGastos";
import { useCartoes } from "@/lib/useCartoes";
import { useContasBancarias } from "@/lib/useContasBancarias";
import { MoneyInput } from "@/components/MoneyInput";
import { ErroBanner } from "@/components/ErroBanner";
import { IconMic } from "@/components/icons";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function criarReconhecimento(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike })
      .SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike })
      .webkitSpeechRecognition;
  if (!Ctor) return null;
  const reconhecimento = new Ctor();
  reconhecimento.lang = "pt-BR";
  reconhecimento.continuous = false;
  reconhecimento.interimResults = false;
  return reconhecimento;
}

export default function GastosPage() {
  const { gastos, loading, erro, adicionar, editar, remover } = useGastos();
  const { cartoes } = useCartoes();
  const { contas: contasBancarias } = useContasBancarias();

  const [texto, setTexto] = useState("");
  const [gravando, setGravando] = useState(false);
  const [ultimoRegistro, setUltimoRegistro] = useState<string | null>(null);
  const [avisoParcial, setAvisoParcial] = useState<string | null>(null);
  const reconhecimentoRef = useRef<SpeechRecognitionLike | null>(null);
  const [suportaVoz] = useState(() => criarReconhecimento() !== null);

  const mes = mesPadrao();
  const gastosDoMes = gastos.filter((g) => g.mes === mes);
  const totalDoMes = gastosDoMes.reduce((acc, g) => acc + g.valor, 0);

  function registrarFrase(frase: string) {
    const interpretado = parseGasto(frase);
    if (!interpretado.valor) {
      setAvisoParcial(
        "Não consegui identificar o valor. Tenta algo como \"Gastei 10 reais com almoço no cartão Nubank\", ou usa o formulário manual abaixo."
      );
      setUltimoRegistro(null);
      return;
    }

    let cartaoId: string | undefined;
    let contaBancariaId: string | undefined;
    let vinculoTexto = "";

    if (interpretado.formaPagamento === "cartao") {
      const cartao = encontrarPorNome(cartoes, interpretado.nomeAlvo);
      cartaoId = cartao?.id;
      vinculoTexto = cartao
        ? `Cartão ${cartao.nome}`
        : interpretado.nomeAlvo
        ? `cartão "${interpretado.nomeAlvo}" (não encontrado, salvo sem vínculo)`
        : "cartão";
    } else if (interpretado.formaPagamento === "pix") {
      const conta = encontrarPorNome(contasBancarias, interpretado.nomeAlvo);
      contaBancariaId = conta?.id;
      vinculoTexto = conta
        ? `Pix ${conta.nome}`
        : interpretado.nomeAlvo
        ? `pix "${interpretado.nomeAlvo}" (conta não encontrada, salvo sem vínculo)`
        : "Pix";
    } else {
      vinculoTexto = "Dinheiro";
    }

    const descricao = interpretado.descricao || "Gasto";

    adicionar({
      descricao,
      valor: interpretado.valor,
      formaPagamento: interpretado.formaPagamento ?? "dinheiro",
      cartaoId,
      contaBancariaId,
      textoOriginal: frase,
    }).catch(console.error);

    setUltimoRegistro(
      `${formatarMoeda(interpretado.valor)} · ${descricao} · ${vinculoTexto}`
    );
    setAvisoParcial(null);
    setTexto("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    registrarFrase(texto.trim());
  }

  function alternarGravacao() {
    if (gravando) {
      reconhecimentoRef.current?.stop();
      return;
    }
    const reconhecimento = criarReconhecimento();
    if (!reconhecimento) return;
    reconhecimentoRef.current = reconhecimento;
    reconhecimento.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setTexto(transcript);
      registrarFrase(transcript);
    };
    reconhecimento.onerror = () => setGravando(false);
    reconhecimento.onend = () => setGravando(false);
    setGravando(true);
    reconhecimento.start();
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-1">Gastos</h1>
      <p className="text-xs text-text-faint mb-4">
        Fale ou digite o que você gastou — registra sozinho
      </p>
      <ErroBanner mensagem={erro} />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-line bg-surface p-4 mb-3 space-y-2"
      >
        <div className="flex gap-2">
          <input
            placeholder='Ex: "Gastei 3 reais com paieiro no cartão Santander CNPJ"'
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="flex-1 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand"
          />
          {suportaVoz && (
            <button
              type="button"
              onClick={alternarGravacao}
              aria-label={gravando ? "Parar gravação" : "Falar"}
              className={`rounded-lg border px-3 transition-colors ${
                gravando
                  ? "border-negative bg-negative-soft text-negative animate-pulse"
                  : "border-line text-text-muted hover:text-brand hover:border-brand/40"
              }`}
            >
              <IconMic />
            </button>
          )}
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[#04120e] hover:bg-brand-dark transition-colors"
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
        <span className="text-sm text-text-muted">Total do mês</span>
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
        <ul className="space-y-2">
          {gastosDoMes.map((g) => (
            <ItemGasto
              key={g.id}
              gasto={g}
              cartoes={cartoes}
              contasBancarias={contasBancarias}
              onEditar={editar}
              onRemover={remover}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemGasto({
  gasto,
  cartoes,
  contasBancarias,
  onEditar,
  onRemover,
}: {
  gasto: Gasto;
  cartoes: { id: string; nome: string }[];
  contasBancarias: { id: string; nome: string }[];
  onEditar: (
    id: string,
    dados: {
      descricao: string;
      valor: number;
      formaPagamento: FormaPagamento;
      cartaoId?: string;
      contaBancariaId?: string;
    }
  ) => void;
  onRemover: (id: string) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [descricao, setDescricao] = useState(gasto.descricao);
  const [valor, setValor] = useState(gasto.valor);
  const [formaPagamento, setFormaPagamento] = useState(gasto.formaPagamento);
  const [cartaoId, setCartaoId] = useState(gasto.cartaoId ?? "");
  const [contaBancariaId, setContaBancariaId] = useState(
    gasto.contaBancariaId ?? ""
  );

  const nomeCartao = cartoes.find((c) => c.id === gasto.cartaoId)?.nome;
  const nomeConta = contasBancarias.find(
    (c) => c.id === gasto.contaBancariaId
  )?.nome;

  const rotuloForma =
    gasto.formaPagamento === "cartao"
      ? nomeCartao
        ? `Cartão ${nomeCartao}`
        : "Cartão"
      : gasto.formaPagamento === "pix"
      ? nomeConta
        ? `Pix ${nomeConta}`
        : "Pix"
      : "Dinheiro";

  function salvar() {
    const descAparada = descricao.trim();
    if (!descAparada || !valor) return;
    onEditar(gasto.id, {
      descricao: descAparada,
      valor,
      formaPagamento,
      cartaoId: formaPagamento === "cartao" ? cartaoId : undefined,
      contaBancariaId: formaPagamento === "pix" ? contaBancariaId : undefined,
    });
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
            value={formaPagamento}
            onChange={(e) =>
              setFormaPagamento(e.target.value as FormaPagamento)
            }
            className="rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
          >
            <option value="cartao">Cartão</option>
            <option value="pix">Pix</option>
            <option value="dinheiro">Dinheiro</option>
          </select>
        </div>
        {formaPagamento === "cartao" && (
          <select
            value={cartaoId}
            onChange={(e) => setCartaoId(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
          >
            <option value="">Qual cartão?</option>
            {cartoes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        )}
        {formaPagamento === "pix" && (
          <select
            value={contaBancariaId}
            onChange={(e) => setContaBancariaId(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-brand"
          >
            <option value="">Qual conta?</option>
            {contasBancarias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        )}
        <div className="flex gap-2">
          <button
            onClick={salvar}
            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-[#04120e]"
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
      <div className="min-w-0">
        <p className="text-sm truncate">{gasto.descricao}</p>
        <p className="text-xs text-text-faint">{rotuloForma}</p>
      </div>
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
