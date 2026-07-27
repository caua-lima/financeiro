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

6. Rode localmente:

   ```
   npm install
   npm run dev
   ```

## Deploy na Vercel

Configure as mesmas variáveis de ambiente (`NEXT_PUBLIC_FIREBASE_*`) no
projeto da Vercel antes do primeiro deploy.
