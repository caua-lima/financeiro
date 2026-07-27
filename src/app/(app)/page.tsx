"use client";

import { useState } from "react";
import { mesAtual, formatarMoeda } from "@/lib/types";
import { useGanhos } from "@/lib/useGanhos";
import { useContasFixas } from "@/lib/useContasFixas";
import { useParcelas } from "@/lib/useParcelas";
import { MonthSelector } from "@/components/MonthSelector";

export default function DashboardPage() {
  const [mes, setMes] = useState(mesAtual());
  const ganhos = useGanhos(mes);
  const contas = useContasFixas();
  const parcelas = useParcelas();

  const sobra = ganhos.total - contas.total - parcelas.total;
  const carregando = ganhos.loading || contas.loading || parcelas.loading;

  return (
    <div>
      <MonthSelector mes={mes} onChange={setMes} />

      {carregando ? (
        <p className="text-sm text-neutral-500">Carregando...</p>
      ) : (
        <div className="space-y-4">
          <div
            className={`rounded-2xl border p-6 text-center ${
              sobra >= 0
                ? "border-emerald-800 bg-emerald-950/40"
                : "border-red-800 bg-red-950/40"
            }`}
          >
            <p className="text-sm text-neutral-400">Vai sobrar</p>
            <p
              className={`text-3xl font-bold mt-1 ${
                sobra >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatarMoeda(sobra)}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <ResumoCard
              label="Ganhos"
              valor={ganhos.total}
              cor="text-emerald-400"
            />
            <ResumoCard
              label="Contas fixas"
              valor={contas.total}
              cor="text-orange-400"
            />
            <ResumoCard
              label="Parcelas"
              valor={parcelas.total}
              cor="text-orange-400"
            />
          </div>

          <div className="rounded-2xl border border-neutral-800 p-4">
            <h2 className="text-sm font-medium text-neutral-300 mb-3">
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
                valor={parcelas.total}
                sinal="-"
              />
              <div className="border-t border-neutral-800 pt-2 flex justify-between font-semibold">
                <span>Sobra</span>
                <span className={sobra >= 0 ? "text-emerald-400" : "text-red-400"}>
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
    <div className="rounded-xl border border-neutral-800 p-3 text-center">
      <p className="text-xs text-neutral-500">{label}</p>
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
    <div className="flex justify-between text-neutral-400">
      <span>{label}</span>
      <span className={sinal === "+" ? "text-emerald-400" : "text-orange-400"}>
        {sinal} {formatarMoeda(valor)}
      </span>
    </div>
  );
}
