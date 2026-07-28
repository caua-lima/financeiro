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
import { Parcela, TipoParcela } from "./types";
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
    cartaoId?: string
  ) {
    if (!user) return;
    try {
      await addDoc(collection(db, "usuarios", user.uid, "parcelas"), {
        tipo,
        ...(tipo === "cartao" && cartaoId ? { cartaoId } : {}),
        nome,
        valorParcela,
        totalParcelas,
        parcelasRestantes,
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
      cartaoId?: string;
    }
  ) {
    if (!user) return;
    try {
      const { cartaoId, ...resto } = dados;
      await updateDoc(doc(db, "usuarios", user.uid, "parcelas", id), {
        ...resto,
        cartaoId: dados.tipo === "cartao" && cartaoId ? cartaoId : null,
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

  async function darBaixa(id: string, parcelasRestantes: number) {
    if (!user) return;
    const novoValor = Math.max(0, parcelasRestantes - 1);
    try {
      await updateDoc(doc(db, "usuarios", user.uid, "parcelas", id), {
        parcelasRestantes: novoValor,
      });
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  const ativas = parcelas.filter((p) => p.parcelasRestantes > 0);
  const total = ativas.reduce((acc, p) => acc + p.valorParcela, 0);

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
  };
}
