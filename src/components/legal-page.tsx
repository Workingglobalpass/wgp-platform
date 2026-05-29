/**
 * Layout pagina legale.
 * Stile sobrio, leggibile, niente colore di brand sopra il contenuto.
 * Server component.
 */
type Props = {
  title: string;
  children: React.ReactNode;
};

export default function LegalPage({ title, children }: Props) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--wgp-navy)]">
        {title}
      </h1>
      <div className="prose mt-8 text-[var(--wgp-navy)] [&_p]:text-[var(--wgp-grey-text)] [&_p]:leading-relaxed [&_h2]:text-[var(--wgp-navy)] [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold">
        {children}
      </div>
    </main>
  );
}
