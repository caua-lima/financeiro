"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Nav } from "@/components/Nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-neutral-500 text-sm">Carregando...</p>
      </main>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <main className="flex-1 px-4 py-6 pb-24 md:pb-6 max-w-3xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
