/**
 * RNF-01: Legal disclaimer per SPECS_RF.
 * Persistent banner — not blocking but always visible in Dashboard and Plan.
 */
export function LegalDisclaimer({
  text = '⚕️ Aviso legal: Este plan debe ser validado por un dietista-nutricionista colegiado.',
}: {
  text?: string;
}) {
  return (
    <div
      className="bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-900 dark:text-amber-300"
      role="alert"
      aria-label="Aviso legal dietista"
    >
      {text}
    </div>
  );
}
