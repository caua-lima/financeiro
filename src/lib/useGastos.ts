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
import { Gasto, mesPadrao } from "./types";
import { useAuth } from "./AuthContext";
import { mensagemErro } from "./erroFirebase";

export function useGastos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      collection(db, "usuarios", user.uid, "gastos"),
      (snap) => {
        setTodos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Gasto)));
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

  const gastos = useMemo(
    () => [...todos].sort((a, b) => b.criadoEm - a.criadoEm),
    [todos]
  );

  async function adicionar(descricao: string, valor: number, categoria: string) {
    if (!user) return;
    try {
      await addDoc(collection(db, "usuarios", user.uid, "gastos"), {
        descricao,
        valor,
        categoria,
        mes: mesPadrao(),
        criadoEm: Date.now(),
      });
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  async function editar(
    id: string,
    dados: { descricao: string; valor: number; categoria: string }
  ) {
    if (!user) return;
    try {
      await updateDoc(doc(db, "usuarios", user.uid, "gastos", id), dados);
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  async function remover(id: string) {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "usuarios", user.uid, "gastos", id));
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  return { gastos, loading, erro, adicionar, editar, remover };
}
