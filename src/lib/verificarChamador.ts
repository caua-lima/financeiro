import { NextRequest } from "next/server";
import { verificarIdToken, TokenVerificado } from "./googleAuth";

export async function verificarChamador(
  req: NextRequest
): Promise<TokenVerificado | null> {
  const cabecalho = req.headers.get("authorization") ?? "";
  const token = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : null;
  if (!token) return null;
  try {
    return await verificarIdToken(token);
  } catch {
    return null;
  }
}
