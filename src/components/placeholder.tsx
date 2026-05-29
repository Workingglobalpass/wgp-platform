/**
 * Placeholder route per Sprint 1.
 * Server Component: niente client state, niente i18n forzato.
 *
 * Sostituire con l'implementazione reale nello Sprint indicato.
 */
type Props = {
  title: string;
  sprint: number;
  description?: string;
};

export default function Placeholder({ title, sprint, description }: Props) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-xl w-full rounded-2xl border border-[var(--wgp-grey-text)]/15 bg-white p-10 text-center shadow-sm">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--wgp-electric)]">
          Sprint {sprint}
        </p>
        <h1 className="text-2xl font-semibold text-[var(--wgp-navy)]">{title}</h1>
        {description ? (
          <p className="mt-3 text-sm text-[var(--wgp-grey-text)]">{description}</p>
        ) : (
          <p className="mt-3 text-sm text-[var(--wgp-grey-text)]">
            Pagina in costruzione. Disponibile nello Sprint {sprint}.
          </p>
        )}
      </div>
    </main>
  );
}
