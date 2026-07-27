import { FirebaseError } from "firebase/app";

export function mensagemErro(e: unknown): string {
  if (e instanceof FirebaseError) {
    if (e.code === "permission-denied") {
      return "Sem permissão para acessar o Firestore. Publique as regras de segurança (firestore.rules) no console do Firebase.";
    }
    if (e.code === "unavailable") {
      return "Sem conexão com o Firestore no momento.";
    }
    return `Erro do Firestore: ${e.message}`;
  }
  if (e instanceof Error) return e.message;
  return "Erro inesperado.";
}
