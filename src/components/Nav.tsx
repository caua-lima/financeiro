"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Logo } from "./Logo";

const links = [
  { href: "/", label: "Resumo", icon: "📊" },
  { href: "/ganhos", label: "Ganhos", icon: "💰" },
  { href: "/contas", label: "Contas", icon: "🧾" },
  { href: "/parcelas", label: "Parcelas", icon: "📅" },
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
      <header className="hidden md:flex items-center justify-between border-b border-line px-6 py-3.5">
        <Logo />
        <nav className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                pathname === link.href
                  ? "bg-brand-soft text-brand"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="text-sm text-text-muted hover:text-text"
        >
          Sair
        </button>
      </header>

      <header className="md:hidden flex items-center justify-between border-b border-line px-4 py-3">
        <Logo />
        <button
          onClick={handleLogout}
          className="text-sm text-text-muted hover:text-text"
        >
          Sair
        </button>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 flex border-t border-line bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs transition-colors ${
              pathname === link.href ? "text-brand" : "text-text-faint"
            }`}
          >
            <span className="text-lg leading-none">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
