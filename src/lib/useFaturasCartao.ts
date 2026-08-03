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
import { FaturaCartao } from "./types";
import { useAuth } from "./AuthContext";
import { mensagemErro } from "./erroFirebase";

export function useFaturasCartao(mes: string) {
  const { user } = useAuth();
  const [todas, setTodas] = useState<FaturaCartao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      collection(db, "usuarios", user.uid, "faturasCartao"),
      (snap) => {
        setTodas(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as FaturaCartao))
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

  const faturas = useMemo(
    () =>
      todas
        .filter((f) => f.mes === mes)
        .sort((a, b) => b.criadoEm - a.criadoEm),
    [todas, mes]
  );

  async function adicionar(nome: string, valor: number) {
    if (!user) return;
    try {
      await addDoc(collection(db, "usuarios", user.uid, "faturasCartao"), {
        nome,
        valor,
        mes,
        criadoEm: Date.now(),
      });
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  async function editar(id: string, dados: { nome: string; valor: number }) {
    if (!user) return;
    try {
      await updateDoc(
        doc(db, "usuarios", user.uid, "faturasCartao", id),
        dados
      );
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  async function remover(id: string) {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "usuarios", user.uid, "faturasCartao", id));
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  const total = faturas.reduce((acc, f) => acc + f.valor, 0);

  return { faturas, loading, erro, total, adicionar, editar, remover };
}
