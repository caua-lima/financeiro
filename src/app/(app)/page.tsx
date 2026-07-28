"use client";

import { useMemo, useState } from "react";
import { mesPadrao, formatarMoeda, parcelasRestantesEm } from "@/lib/types";
import { useGanhos } from "@/lib/useGanhos";
import { useContasFixas } from "@/lib/useContasFixas";
import { useParcelas } from "@/lib/useParcelas";
import { MonthSelector } from "@/components/MonthSelector";
import { ErroBanner } from "@/components/ErroBanner";

export default function DashboardPage() {
  const [mes, setMes] = useState(mesPadrao());
  const ganhos = useGanhos(mes);
  const contas = useContasFixas();
  const parcelas = useParcelas();

  const totalParcelasNoMes = useMemo(
    () =>
      parcelas.parcelas.reduce(
        (acc, p) =>
          parcelasRestantesEm(p, mes) > 0 ? acc + p.valorParcela : acc,
        0
      ),
    [parcelas.parcelas, mes]
  );

  const sobra = ganhos.total - contas.total - totalParcelasNoMes;
  const carregando = ganhos.loading || contas.loading || parcelas.loading;
  const erro = ganhos.erro || contas.erro || parcelas.erro;

  return (
    <div>
      <MonthSelector mes={mes} onChange={setMes} />
      <ErroBanner mensagem={erro} />

      {carregando ? (
        <p className="text-sm text-text-faint">Carregando...</p>
      ) : (
        <div className="space-y-4">
          <div
            className={`rounded-2xl border p-6 text-center ${
              sobra >= 0
                ? "border-brand/25 bg-positive-soft"
                : "border-negative/40 bg-negative-soft"
            }`}
          >
            <p className="text-sm text-text-muted">Vai sobrar</p>
            <p
              className={`text-3xl font-bold mt-1 ${
                sobra >= 0 ? "text-positive" : "text-negative"
              }`}
            >
              {formatarMoeda(sobra)}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <ResumoCard label="Ganhos" valor={ganhos.total} cor="text-positive" />
            <ResumoCard
              label="Contas fixas"
              valor={contas.total}
              cor="text-gold"
            />
            <ResumoCard
              label="Parcelas"
              valor={totalParcelasNoMes}
              cor="text-gold"
            />
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4">
            <h2 className="text-sm font-medium text-text-muted mb-3">
              Detalhamento
            </h2>
            <div className="space-y-2 text-sm">
              <Linha label="Ganhos do mês" valor={ganhos.total} sinal="+" />
              <Linha
                label="Contas fixas ativas"
                valor={contas.total}
                sinal="-"
              />
              <Linha
                label="Parcelas em andamento"
                valor={totalParcelasNoMes}
                sinal="-"
              />
              <div className="border-t border-line pt-2 flex justify-between font-semibold">
                <span>Sobra</span>
                <span className={sobra >= 0 ? "text-positive" : "text-negative"}>
                  {formatarMoeda(sobra)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResumoCard({
  label,
  valor,
  cor,
}: {
  label: string;
  valor: number;
  cor: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3 text-center">
      <p className="text-xs text-text-faint">{label}</p>
      <p className={`text-sm font-semibold mt-1 ${cor}`}>
        {formatarMoeda(valor)}
      </p>
    </div>
  );
}

function Linha({
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
