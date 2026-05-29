import ComingSoon from '@/components/coming-soon';
// Brief §16.13: Housing UI = "Coming September 2026". Mai aprire prima.
export default function Page() {
  return (
    <ComingSoon
      title="Alloggi verificati per chi lavora"
      eta="Settembre 2026"
      description="Standard di sicurezza, contratti chiari, accesso riservato a profili verificati. Il modulo Housing apre a settembre 2026."
    />
  );
}
