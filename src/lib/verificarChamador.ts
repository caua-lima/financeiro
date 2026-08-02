import { NextRequest } from "next/server";
import { getAdminAuth } from "./firebaseAdmin";

export async function verificarChamador(req: NextRequest) {
  const cabecalho = req.headers.get("authorization") ?? "";
  const token = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : null;
  if (!token) return null;
  try {
    return await getAdminAuth().verifyIdToken(token);
  } catch {
    return null;
  }
}
