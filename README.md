# Financeiro

Controle financeiro pessoal: ganhos mensais, contas fixas e parcelas, com o
quanto sobra por mês.

## Stack

- Next.js (App Router) + Tailwind
- Firebase Auth (e-mail/senha) + Firestore

## Configurar

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Ative **Authentication > Sign-in method > E-mail/senha** e crie seu usuário
   (Authentication > Users > Add user).
3. Ative o **Firestore Database** (modo produção).
4. Em Configurações do projeto > Geral > Seus apps, crie um app Web e copie as
   credenciais para um arquivo `.env.local` na raiz (veja
   `.env.local.example`):

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   ```

5. Faça deploy das regras do Firestore (`firestore.rules`) pelo console ou via
   `firebase deploy --only firestore:rules` (precisa do Firebase CLI logado).

6. Pra usar a tela **Acesso** (criar/editar/excluir logins), gere uma chave de
   serviço: Firebase Console > Configurações do projeto > Contas de serviço >
   Gerar nova chave privada. Isso baixa um `.json` — copie os campos pro
   `.env.local` (essas variáveis **nunca** levam `NEXT_PUBLIC_`, pois só
   podem rodar no servidor):

   ```
   FIREBASE_PROJECT_ID=
   FIREBASE_CLIENT_EMAIL=
   FIREBASE_PRIVATE_KEY=
   ```

7. Rode localmente:

   ```
   npm install
   npm run dev
   ```

## Deploy na Vercel

Configure as mesmas variáveis de ambiente (`NEXT_PUBLIC_FIREBASE_*` e
`FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`) no
projeto da Vercel antes do primeiro deploy. Ao colar `FIREBASE_PRIVATE_KEY`,
mantenha as quebras de linha como `\n` (cole o valor inteiro entre aspas).
