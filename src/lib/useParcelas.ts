"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Parcela, TipoParcela, mesPadrao, valorMinhaParte } from "./types";
import { useAuth } from "./AuthContext";
import { mensagemErro } from "./erroFirebase";

export function useParcelas() {
  const { user } = useAuth();
  const [todas, setTodas] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      collection(db, "usuarios", user.uid, "parcelas"),
      (snap) => {
        setTodas(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Parcela))
        );
        setLoading(false);
        setErro(null);
      },
      (e) => {
        setErro(mensagemErro(e));
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  const parcelas = useMemo(
    () => [...todas].sort((a, b) => b.criadoEm - a.criadoEm),
    [todas]
  );

  async function adicionar(
    nome: string,
    valorParcela: number,
    totalParcelas: number,
    parcelasRestantes: number,
    tipo: TipoParcela,
    dividida?: boolean,
    naFatura?: boolean,
    cartao?: string
  ) {
    if (!user) return;
    try {
      await addDoc(collection(db, "usuarios", user.uid, "parcelas"), {
        tipo,
        nome,
        valorParcela,
        totalParcelas,
        parcelasRestantes,
        dividida: !!dividida,
        naFatura: tipo === "cartao" ? !!naFatura : false,
        ...(tipo === "cartao" && cartao ? { cartao } : {}),
        mesReferencia: mesPadrao(),
        criadoEm: Date.now(),
      });
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  async function editar(
    id: string,
    dados: {
      nome: string;
      valorParcela: number;
      totalParcelas: number;
      parcelasRestantes: number;
      tipo: TipoParcela;
      dividida?: boolean;
      naFatura?: boolean;
      cartao?: string;
    }
  ) {
    if (!user) return;
    try {
      const { cartao, ...resto } = dados;
      await updateDoc(doc(db, "usuarios", user.uid, "parcelas", id), {
        ...resto,
        dividida: !!dados.dividida,
        naFatura: dados.tipo === "cartao" ? !!dados.naFatura : false,
        cartao: dados.tipo === "cartao" && cartao ? cartao : null,
        mesReferencia: mesPadrao(),
      });
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  async function remover(id: string) {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "usuarios", user.uid, "parcelas", id));
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  async function darBaixa(id: string) {
    if (!user) return;
    const p = parcelas.find((x) => x.id === id);
    if (!p) return;
    const novoValor = Math.max(0, p.parcelasRestantes - 1);
    try {
      await updateDoc(doc(db, "usuarios", user.uid, "parcelas", id), {
        parcelasRestantes: novoValor,
        mesReferencia: mesPadrao(),
      });
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  async function reverterBaixa(id: string) {
    if (!user) return;
    const p = parcelas.find((x) => x.id === id);
    if (!p) return;
    const novoValor = Math.min(p.totalParcelas, p.parcelasRestantes + 1);
    try {
      await updateDoc(doc(db, "usuarios", user.uid, "parcelas", id), {
        parcelasRestantes: novoValor,
        mesReferencia: mesPadrao(),
      });
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  const ativas = parcelas.filter((p) => p.parcelasRestantes > 0);
  const total = ativas
    .filter((p) => !p.naFatura)
    .reduce((acc, p) => acc + valorMinhaParte(p), 0);

  return {
    parcelas,
    ativas,
    loading,
    erro,
    total,
    adicionar,
    editar,
    remover,
    darBaixa,
    reverterBaixa,
  };
}
