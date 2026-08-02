import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";
import { verificarChamador } from "@/lib/verificarChamador";

export const runtime = "nodejs";

function mensagemDeErro(e: unknown, padrao: string): string {
  if (e instanceof Error) return e.message;
  return padrao;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const chamador = await verificarChamador(req);
    if (!chamador) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }

    const { uid } = await params;
    const { email, senha, disabled } = await req.json();

    await getAdminAuth().updateUser(uid, {
      ...(email ? { email } : {}),
      ...(senha ? { password: senha } : {}),
      ...(typeof disabled === "boolean" ? { disabled } : {}),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { erro: mensagemDeErro(e, "Erro ao editar usuário.") },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const chamador = await verificarChamador(req);
    if (!chamador) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }

    const { uid } = await params;
    await getAdminAuth().deleteUser(uid);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { erro: mensagemDeErro(e, "Erro ao excluir usuário.") },
      { status: 500 }
    );
  }
}
