/**
 * Componente "Coming Soon" per pagine pubbliche preview.
 * Differente da Placeholder: questa è una pagina pubblica destinata
 * agli utenti finali (es. /for-housing, /for-volunteers).
 *
 * Brief §16.13: Housing UI = "Coming September 2026" placeholder.
 */
type Props = {
  title: string;
  eta: string;          // es. "Settembre 2026"
  description: string;
};

export default function ComingSoon({ title, eta, description }: Props) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-2xl w-full text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--wgp-electric)]">
          Coming {eta}
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--wgp-navy)]">
          {title}
        </h1>
        <p className="mt-6 text-base sm:text-lg leading-relaxed text-[var(--wgp-grey-text)]">
          {description}
        </p>
      </div>
    </main>
  );
}
