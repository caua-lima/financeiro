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
import { ContaFixa } from "./types";
import { useAuth } from "./AuthContext";

export function useContasFixas() {
  const { user } = useAuth();
  const [todas, setTodas] = useState<ContaFixa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      collection(db, "usuarios", user.uid, "contasFixas"),
      (snap) => {
        setTodas(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContaFixa))
        );
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  const contas = useMemo(
    () => [...todas].sort((a, b) => b.criadoEm - a.criadoEm),
    [todas]
  );

  async function adicionar(nome: string, valor: number, categoria: string) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "contasFixas"), {
      nome,
      valor,
      categoria,
      ativa: true,
      criadoEm: Date.now(),
    });
  }

  async function editar(
    id: string,
    dados: { nome: string; valor: number; categoria: string }
  ) {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "contasFixas", id), dados);
  }

  async function remover(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "contasFixas", id));
  }

  async function alternarAtiva(id: string, ativa: boolean) {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "contasFixas", id), {
      ativa,
    });
  }

  const total = contas
    .filter((c) => c.ativa)
    .reduce((acc, c) => acc + c.valor, 0);

  return { contas, loading, total, adicionar, editar, remover, alternarAtiva };
}
