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
import { Ganho } from "./types";
import { useAuth } from "./AuthContext";

export function useGanhos(mes: string) {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Ganho[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      collection(db, "usuarios", user.uid, "ganhos"),
      (snap) => {
        setTodos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ganho)));
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  const recorrentes = useMemo(
    () =>
      todos
        .filter((g) => g.tipo === "recorrente")
        .sort((a, b) => b.criadoEm - a.criadoEm),
    [todos]
  );

  const pontuais = useMemo(
    () =>
      todos
        .filter((g) => g.tipo === "pontual" && g.mes === mes)
        .sort((a, b) => b.criadoEm - a.criadoEm),
    [todos, mes]
  );

  async function adicionarRecorrente(descricao: string, valor: number) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "ganhos"), {
      tipo: "recorrente",
      ativo: true,
      descricao,
      valor,
      criadoEm: Date.now(),
    });
  }

  async function adicionarPontual(descricao: string, valor: number) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "ganhos"), {
      tipo: "pontual",
      mes,
      descricao,
      valor,
      criadoEm: Date.now(),
    });
  }

  async function editar(
    id: string,
    dados: { descricao: string; valor: number }
  ) {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "ganhos", id), dados);
  }

  async function remover(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "ganhos", id));
  }

  async function alternarAtivo(id: string, ativo: boolean) {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "ganhos", id), { ativo });
  }

  const totalRecorrentes = recorrentes
    .filter((g) => g.ativo !== false)
    .reduce((acc, g) => acc + g.valor, 0);
  const totalPontuais = pontuais.reduce((acc, g) => acc + g.valor, 0);
  const total = totalRecorrentes + totalPontuais;

  return {
    recorrentes,
    pontuais,
    loading,
    total,
    adicionarRecorrente,
    adicionarPontual,
    editar,
    remover,
    alternarAtivo,
  };
}
