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
import { ContaBancaria } from "./types";
import { useAuth } from "./AuthContext";
import { mensagemErro } from "./erroFirebase";

export function useContasBancarias() {
  const { user } = useAuth();
  const [todas, setTodas] = useState<ContaBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      collection(db, "usuarios", user.uid, "contasBancarias"),
      (snap) => {
        setTodas(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContaBancaria))
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

  const contas = useMemo(
    () => [...todas].sort((a, b) => b.criadoEm - a.criadoEm),
    [todas]
  );

  async function adicionar(nome: string, saldoInicial: number) {
    if (!user) return;
    try {
      await addDoc(collection(db, "usuarios", user.uid, "contasBancarias"), {
        nome,
        saldoInicial,
        criadoEm: Date.now(),
      });
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  async function editar(
    id: string,
    dados: { nome: string; saldoInicial: number }
  ) {
    if (!user) return;
    try {
      await updateDoc(
        doc(db, "usuarios", user.uid, "contasBancarias", id),
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
      await deleteDoc(doc(db, "usuarios", user.uid, "contasBancarias", id));
      setErro(null);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  return { contas, loading, erro, adicionar, editar, remover };
}
