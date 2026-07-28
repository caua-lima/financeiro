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
import { Gasto, FormaPagamento, mesPadrao } from "./types";
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

  async function adicionar(dados: {
    descricao: string;
    valor: number;
    formaPagamento: FormaPagamento;
    cartaoId?: string;
    contaBancariaId?: string;
    textoOriginal?: string;
  }) {
    if (!user) return;
    try {
      await addDoc(collection(db, "usuarios", user.uid, "gastos"), {
        descricao: dados.descricao,
        valor: dados.valor,
        formaPagamento: dados.formaPagamento,
        ...(dados.formaPagamento === "cartao" && dados.cartaoId
          ? { cartaoId: dados.cartaoId }
          : {}),
        ...(dados.formaPagamento === "pix" && dados.contaBancariaId
          ? { contaBancariaId: dados.contaBancariaId }
          : {}),
        ...(dados.textoOriginal ? { textoOriginal: dados.textoOriginal } : {}),
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
    dados: {
      descricao: string;
      valor: number;
      formaPagamento: FormaPagamento;
      cartaoId?: string;
      contaBancariaId?: string;
    }
  ) {
    if (!user) return;
    try {
      await updateDoc(doc(db, "usuarios", user.uid, "gastos", id), {
        descricao: dados.descricao,
        valor: dados.valor,
        formaPagamento: dados.formaPagamento,
        cartaoId:
          dados.formaPagamento === "cartao" ? dados.cartaoId || null : null,
        contaBancariaId:
          dados.formaPagamento === "pix"
            ? dados.contaBancariaId || null
            : null,
      });
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

  const doMes = (mes: string) => gastos.filter((g) => g.mes === mes);
  const totalNoMes = (mes: string) =>
    doMes(mes).reduce((acc, g) => acc + g.valor, 0);

  return { gastos, loading, erro, adicionar, editar, remover, doMes, totalNoMes };
}
