import type { Translations } from '@shared/i18n';
import type { CulturalMetadata } from '@shared/domain';

const COOKING_TECHNIQUE_I18N: Record<string, string> = {
  stew: 'cooking.stew',
  steam: 'cooking.steam',
  boiled: 'cooking.boiled',
  grilled: 'cooking.grilled',
  raw: 'cooking.raw',
};

export function CulturalBadges({
  meta,
  translate: t,
}: {
  meta: CulturalMetadata;
  translate: Translations;
}) {
  return (
    <>
      <span className="inline-flex gap-1 ml-1" aria-label="Metadata cultural UNESCO">
        {meta.traditionalCuisine && (
          <span
            title={t['cultural.traditionalCuisine']}
            aria-label={t['cultural.traditionalCuisine']}
          >
            <span aria-hidden="true">🏺</span>
          </span>
        )}
        {meta.socialEating && (
          <span
            title={t['cultural.socialEatingBadge']}
            aria-label={t['cultural.socialEatingBadge']}
          >
            <span aria-hidden="true">👥</span>
          </span>
        )}
        {meta.erMedDiet && (
          <span title="erMedDiet" aria-label="erMedDiet">
            <span aria-hidden="true">🌿</span>
          </span>
        )}
      </span>
      {meta.socialEating && (
        <span className="text-xs text-emerald-700 ml-1">{t['cultural.socialEating']}</span>
      )}
      {meta.cookingTechnique && COOKING_TECHNIQUE_I18N[meta.cookingTechnique] && (
        <span className="text-xs text-stone-500 dark:text-zinc-400 ml-1">
          {t['cultural.preparation']}:{' '}
          {t[COOKING_TECHNIQUE_I18N[meta.cookingTechnique] as keyof typeof t]}
        </span>
      )}
    </>
  );
}
