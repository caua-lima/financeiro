import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin usa APIs nativas do Node e não pode ser empacotado no
  // bundle do servidor — sem isso, as rotas /api/usuarios quebram em
  // produção antes mesmo de executar qualquer código nosso.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
