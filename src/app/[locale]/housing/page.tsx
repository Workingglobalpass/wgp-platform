import ComingSoon from '@/components/coming-soon';
// Brief §16.13: Mai aprire Housing prima di settembre 2026.
// Schema dati pronto in DB ma RLS chiusa. Feature flag housing_visible = false.
export default function Page() {
  return (
    <ComingSoon
      title="Alloggi"
      eta="Settembre 2026"
      description="Apriremo l'accesso agli alloggi a settembre 2026. Standard di sicurezza, contratti chiari, accesso riservato a profili con Verification Score 75%+."
    />
  );
}
