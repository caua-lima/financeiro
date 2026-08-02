import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";
import { verificarChamador } from "@/lib/verificarChamador";

export const runtime = "nodejs";

function mensagemDeErro(e: unknown, padrao: string): string {
  if (e instanceof Error) return e.message;
  return padrao;
}

export async function GET(req: NextRequest) {
  try {
    const chamador = await verificarChamador(req);
    if (!chamador) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }

    const lista = await getAdminAuth().listUsers();
    const usuarios = lista.users.map((u) => ({
      uid: u.uid,
      email: u.email,
      disabled: u.disabled,
      criadoEm: u.metadata.creationTime,
      ultimoLogin: u.metadata.lastSignInTime,
    }));

    return NextResponse.json({ usuarios });
  } catch (e) {
    return NextResponse.json(
      { erro: mensagemDeErro(e, "Erro ao listar usuários.") },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const chamador = await verificarChamador(req);
    if (!chamador) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }

    const { email, senha } = await req.json();
    if (!email || !senha) {
      return NextResponse.json(
        { erro: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const usuario = await getAdminAuth().createUser({ email, password: senha });
    return NextResponse.json({ uid: usuario.uid });
  } catch (e) {
    return NextResponse.json(
      { erro: mensagemDeErro(e, "Erro ao criar usuário.") },
      { status: 500 }
    );
  }
}
