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
import { Cartao } from "./types";
import { useAuth } from "./AuthContext";
import { mensagemErro } from "./erroFirebase";

export function useCartoes() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      collection(db, "usuarios", user.uid, "cartoes"),
      (snap) => {
        setTodos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Cartao)));
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

  const cartoes = useMemo(
    () => [...todos].sort((a, b) => b.criadoEm - a.criadoEm),
    [todos]
  );

  async function adicionar(nome: string) {
    if (!user) return;
    try {
      await addDoc(collection(db, "usuarios", user.uid, "cartoes"), {
        nome,
        criadoEm: Date.now(),
      });
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  async function editar(id: string, dados: { nome: string }) {
    if (!user) return;
    try {
      await updateDoc(doc(db, "usuarios", user.uid, "cartoes", id), dados);
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  async function remover(id: string) {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "usuarios", user.uid, "cartoes", id));
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  return { cartoes, loading, erro, adicionar, editar, remover };
}
