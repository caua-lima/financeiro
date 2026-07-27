"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./firebase";
import { ContaFixa } from "./types";
import { useAuth } from "./AuthContext";

export function useContasFixas() {
  const { user } = useAuth();
  const [contas, setContas] = useState<ContaFixa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "usuarios", user.uid, "contasFixas"),
      orderBy("criadoEm", "desc")
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setContas(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContaFixa))
      );
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

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

  return { contas, loading, total, adicionar, remover, alternarAtiva };
}
