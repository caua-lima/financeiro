import { accessToken, credenciais } from "./googleAuth";

const BASE = "https://identitytoolkit.googleapis.com/v1";

export interface UsuarioFirebase {
  uid: string;
  email: string | null;
  disabled: boolean;
  criadoEm: string;
  ultimoLogin: string;
}

interface RespostaConta {
  localId: string;
  email?: string;
  disabled?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

async function chamar(
  caminho: string,
  corpo: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { projectId } = credenciais();
  const token = await accessToken();

  const resposta = await fetch(`${BASE}/projects/${projectId}${caminho}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(corpo),
  });

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const mensagem =
      (dados as { error?: { message?: string } })?.error?.message ??
      `Erro ${resposta.status} na API do Firebase.`;
    throw new Error(traduzir(mensagem));
  }
  return dados as Record<string, unknown>;
}

function traduzir(mensagem: string): string {
  const mapa: Record<string, string> = {
    EMAIL_EXISTS: "Já existe um login com esse e-mail.",
    INVALID_EMAIL: "E-mail inválido.",
    WEAK_PASSWORD: "A senha precisa ter pelo menos 6 caracteres.",
    MISSING_PASSWORD: "Informe uma senha.",
    USER_NOT_FOUND: "Login não encontrado.",
  };
  for (const [chave, texto] of Object.entries(mapa)) {
    if (mensagem.includes(chave)) return texto;
  }
  return mensagem;
}

function paraUsuario(conta: RespostaConta): UsuarioFirebase {
  return {
    uid: conta.localId,
    email: conta.email ?? null,
    disabled: conta.disabled ?? false,
    criadoEm: conta.createdAt
      ? new Date(Number(conta.createdAt)).toISOString()
      : "",
    ultimoLogin: conta.lastLoginAt
      ? new Date(Number(conta.lastLoginAt)).toISOString()
      : "",
  };
}

export async function listarUsuarios(): Promise<UsuarioFirebase[]> {
  const dados = await chamar("/accounts:query", {});
  const contas = (dados.userInfo ?? []) as RespostaConta[];
  return contas.map(paraUsuario);
}

export async function criarUsuario(
  email: string,
  senha: string
): Promise<string> {
  const dados = await chamar("/accounts", { email, password: senha });
  return dados.localId as string;
}

export async function atualizarUsuario(
  uid: string,
  dados: { email?: string; senha?: string; disabled?: boolean }
): Promise<void> {
  await chamar("/accounts:update", {
    localId: uid,
    ...(dados.email ? { email: dados.email } : {}),
    ...(dados.senha ? { password: dados.senha } : {}),
    ...(typeof dados.disabled === "boolean"
      ? { disableUser: dados.disabled }
      : {}),
  });
}

export async function excluirUsuario(uid: string): Promise<void> {
  await chamar("/accounts:delete", { localId: uid });
}
