"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Logo } from "./Logo";
import {
  IconResumo,
  IconGanhos,
  IconContas,
  IconParcelas,
  IconAssinaturas,
  IconDre,
  IconAcesso,
  IconSair,
} from "./icons";

const links = [
  { href: "/", label: "Resumo", Icon: IconResumo },
  { href: "/ganhos", label: "Ganhos", Icon: IconGanhos },
  { href: "/contas", label: "Contas", Icon: IconContas },
  { href: "/parcelas", label: "Parcelas", Icon: IconParcelas },
  { href: "/assinaturas", label: "Assinaturas", Icon: IconAssinaturas },
  { href: "/dre", label: "DRE", Icon: IconDre },
  { href: "/acesso", label: "Acesso", Icon: IconAcesso },
];

export function Nav() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:border-r md:border-line md:px-3 md:py-5">
        <div className="px-2 mb-6">
          <Logo />
        </div>
        <nav className="flex flex-col gap-1 overflow-y-auto">
          {links.map(({ href, label, Icon }) => {
            const ativo = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  ativo
                    ? "bg-brand-soft text-brand"
                    : "text-text-muted hover:bg-surface hover:text-text"
                }`}
              >
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface hover:text-text"
        >
          <IconSair />
          Sair
        </button>
      </aside>

      {/* Header — mobile */}
      <header className="md:hidden flex items-center justify-between border-b border-line px-4 py-3">
        <Logo />
        <button
          onClick={handleLogout}
          className="text-sm text-text-muted hover:text-text"
        >
          Sair
        </button>
      </header>

      {/* Tab bar — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 flex overflow-x-auto border-t border-line bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        {links.map(({ href, label, Icon }) => {
          const ativo = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex w-16 shrink-0 flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ${
                ativo ? "text-brand" : "text-text-faint"
              }`}
            >
              <Icon width={20} height={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
