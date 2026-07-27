"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

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
      <header className="hidden md:flex items-center justify-between border-b border-neutral-800 px-6 py-4">
        <span className="font-semibold">Financeiro</span>
        <nav className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                pathname === link.href
                  ? "bg-emerald-600 text-white"
                  : "text-neutral-400 hover:text-neutral-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="text-sm text-neutral-400 hover:text-neutral-100"
        >
          Sair
        </button>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 flex border-t border-neutral-800 bg-neutral-950/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
              pathname === link.href
                ? "text-emerald-400"
                : "text-neutral-500"
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
