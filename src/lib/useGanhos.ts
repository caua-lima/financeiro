"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { Ganho } from "./types";
import { useAuth } from "./AuthContext";

export function useGanhos(mes: string) {
  const { user } = useAuth();
  const [ganhos, setGanhos] = useState<Ganho[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "usuarios", user.uid, "ganhos"),
      where("mes", "==", mes),
      orderBy("criadoEm", "desc")
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setGanhos(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ganho))
      );
      setLoading(false);
    });
    return unsubscribe;
  }, [user, mes]);

  async function adicionar(descricao: string, valor: number) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "ganhos"), {
      mes,
      descricao,
      valor,
      criadoEm: Date.now(),
    });
  }

  async function remover(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "ganhos", id));
  }

  const total = ganhos.reduce((acc, g) => acc + g.valor, 0);

  return { ganhos, loading, total, adicionar, remover };
}
