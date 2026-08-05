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
import { Assinatura } from "./types";
import { useAuth } from "./AuthContext";
import { mensagemErro } from "./erroFirebase";

export function useAssinaturas() {
  const { user } = useAuth();
  const [todas, setTodas] = useState<Assinatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      collection(db, "usuarios", user.uid, "assinaturas"),
      (snap) => {
        setTodas(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Assinatura))
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

  const assinaturas = useMemo(
    () => [...todas].sort((a, b) => b.criadoEm - a.criadoEm),
    [todas]
  );

  async function adicionar(
    nome: string,
    valor: number,
    cartao?: string,
    naFatura?: boolean
  ) {
    if (!user) return;
    try {
      await addDoc(collection(db, "usuarios", user.uid, "assinaturas"), {
        nome,
        valor,
        ativa: true,
        ...(cartao ? { cartao } : {}),
        naFatura: !!naFatura,
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
      valor: number;
      cartao?: string;
      naFatura?: boolean;
    }
  ) {
    if (!user) return;
    try {
      await updateDoc(doc(db, "usuarios", user.uid, "assinaturas", id), {
        nome: dados.nome,
        valor: dados.valor,
        cartao: dados.cartao || null,
        naFatura: !!dados.naFatura,
      });
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  async function remover(id: string) {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "usuarios", user.uid, "assinaturas", id));
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  async function alternarAtiva(id: string, ativa: boolean) {
    if (!user) return;
    try {
      await updateDoc(doc(db, "usuarios", user.uid, "assinaturas", id), {
        ativa,
      });
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  const ativas = assinaturas.filter((a) => a.ativa);
  const total = ativas
    .filter((a) => !a.naFatura)
    .reduce((acc, a) => acc + a.valor, 0);
  const totalNaFatura = ativas
    .filter((a) => a.naFatura)
    .reduce((acc, a) => acc + a.valor, 0);
  const totalGeral = total + totalNaFatura;

  return {
    assinaturas,
    loading,
    erro,
    total,
    totalNaFatura,
    totalGeral,
    adicionar,
    editar,
    remover,
    alternarAtiva,
  };
}
