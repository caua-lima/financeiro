import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Rota temporária de diagnóstico: diz se as variáveis de ambiente do
 * Firebase chegaram no servidor e se a autenticação com o Google
 * funciona. Não expõe nenhum valor secreto.
 */
export async function GET() {
  const etapas: Record<string, unknown> = {};

  try {
    const chavePrivada = process.env.FIREBASE_PRIVATE_KEY ?? "";
    etapas.env = {
      temProjectId: !!process.env.FIREBASE_PROJECT_ID,
      temClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      temPrivateKey: !!chavePrivada,
      tamanhoPrivateKey: chavePrivada.length,
      comecaCorreto: chavePrivada.startsWith("-----BEGIN PRIVATE KEY-----"),
      comecaComAspas: chavePrivada.startsWith('"'),
    };

    const { accessToken } = await import("@/lib/googleAuth");
    etapas.importOk = true;

    const token = await accessToken();
    etapas.accessTokenOk = !!token;

    const { listarUsuarios } = await import("@/lib/usuariosFirebase");
    const usuarios = await listarUsuarios();
    etapas.listarUsuariosOk = true;
    etapas.totalUsuarios = usuarios.length;

    return NextResponse.json({ ok: true, etapas });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        etapas,
        erro: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack?.split("\n").slice(0, 5) : null,
      },
      { status: 500 }
    );
  }
}
