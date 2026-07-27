export function ErroBanner({ mensagem }: { mensagem: string | null }) {
  if (!mensagem) return null;
  return (
    <div className="mb-4 rounded-xl border border-negative/40 bg-negative-soft px-4 py-3 text-sm text-negative">
      {mensagem}
    </div>
  );
}
