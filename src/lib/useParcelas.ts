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
import { Parcela } from "./types";
import { useAuth } from "./AuthContext";

export function useParcelas() {
  const { user } = useAuth();
  const [todas, setTodas] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      collection(db, "usuarios", user.uid, "parcelas"),
      (snap) => {
        setTodas(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Parcela))
        );
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
    parcelasRestantes: number
  ) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "parcelas"), {
      nome,
      valorParcela,
      totalParcelas,
      parcelasRestantes,
      criadoEm: Date.now(),
    });
  }

  async function editar(
    id: string,
    dados: {
      nome: string;
      valorParcela: number;
      totalParcelas: number;
      parcelasRestantes: number;
    }
  ) {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "parcelas", id), dados);
  }

  async function remover(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "parcelas", id));
  }

  async function darBaixa(id: string, parcelasRestantes: number) {
    if (!user) return;
    const novoValor = Math.max(0, parcelasRestantes - 1);
    await updateDoc(doc(db, "usuarios", user.uid, "parcelas", id), {
      parcelasRestantes: novoValor,
    });
  }

  const ativas = parcelas.filter((p) => p.parcelasRestantes > 0);
  const total = ativas.reduce((acc, p) => acc + p.valorParcela, 0);

  return {
    parcelas,
    ativas,
    loading,
    total,
    adicionar,
    editar,
    remover,
    darBaixa,
  };
}
