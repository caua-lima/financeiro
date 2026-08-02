import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Rota temporária de diagnóstico: diz se as variáveis de ambiente do
 * Firebase Admin chegaram no servidor e se o SDK consegue inicializar.
 * Não expõe nenhum valor secreto — só o formato do que chegou.
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
      temBarraNLiteral: chavePrivada.includes("\\n"),
      temQuebraDeLinhaReal: chavePrivada.includes("\n"),
    };

    const { getAdminAuth } = await import("@/lib/firebaseAdmin");
    etapas.importOk = true;

    const auth = getAdminAuth();
    etapas.initOk = true;

    const lista = await auth.listUsers(1);
    etapas.listUsersOk = true;
    etapas.totalNaPrimeiraPagina = lista.users.length;

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
