"use client";

import { ChangeEvent, useState } from "react";

function digitsToValor(digits: string): number {
  return parseInt(digits || "0", 10) / 100;
}

function digitsToTexto(digits: string): string {
  return digitsToValor(digits).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function MoneyInput({
  value,
  onChange,
  placeholder = "R$ 0,00",
  className,
}: {
  value: number;
  onChange: (valor: number) => void;
  placeholder?: string;
  className?: string;
}) {
  const [digits, setDigits] = useState(() =>
    String(Math.round((value || 0) * 100))
  );
  const [ultimoValor, setUltimoValor] = useState(value);

  if (value !== ultimoValor && digitsToValor(digits) !== value) {
    setUltimoValor(value);
    setDigits(String(Math.round((value || 0) * 100)));
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const somenteDigitos = e.target.value.replace(/\D/g, "");
    const semZerosExtras = somenteDigitos.replace(/^0+(?=\d)/, "");
    const proximo = semZerosExtras || "0";
    setDigits(proximo);
    onChange(digitsToValor(proximo));
  }

  return (
    <input
      inputMode="decimal"
      placeholder={placeholder}
      value={digits === "0" ? "" : digitsToTexto(digits)}
      onChange={handleChange}
      className={className}
    />
  );
}
