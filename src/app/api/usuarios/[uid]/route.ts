import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";
import { verificarChamador } from "@/lib/verificarChamador";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const chamador = await verificarChamador(req);
  if (!chamador) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { uid } = await params;
  const { email, senha, disabled } = await req.json();

  try {
    await getAdminAuth().updateUser(uid, {
      ...(email ? { email } : {}),
      ...(senha ? { password: senha } : {}),
      ...(typeof disabled === "boolean" ? { disabled } : {}),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const mensagem = e instanceof Error ? e.message : "Erro ao editar usuário.";
    return NextResponse.json({ erro: mensagem }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const chamador = await verificarChamador(req);
  if (!chamador) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { uid } = await params;

  try {
    await getAdminAuth().deleteUser(uid);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const mensagem =
      e instanceof Error ? e.message : "Erro ao excluir usuário.";
    return NextResponse.json({ erro: mensagem }, { status: 400 });
  }
}
