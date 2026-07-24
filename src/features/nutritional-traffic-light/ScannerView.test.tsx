import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithI18n } from '@/test/i18n-test-utils';
import { ScannerView } from './ScannerView';
import { food } from '@shared/domain';
import type { Food } from '@shared/domain';

/* ---------- test helpers ---------- */

function makeFood(overrides: Partial<Food> & { id: string; name: string; category: string }): Food {
  return food({
    id: overrides.id,
    name: overrides.name,
    category: overrides.category,
    gramsPerRation: 100,
    kcalPer100g: 100,
    proteinPer100g: 10,
    carbsPer100g: 10,
    fatPer100g: 5,
    ...overrides,
  });
}

const noop = vi.fn();

/* ---------- ScannerView tests ---------- */

describe('ScannerView', () => {
  it('renders "Moderación" (amber) label when result color is orange', () => {
    renderWithI18n(
      <ScannerView
        selectedId=""
        options={[]}
        selected={null}
        result={{ color: 'orange', reasons: ['Alto en grasas'] }}
        safetyAlerts={[]}
        onSelect={noop}
        onClassify={noop}
        onAddToLog={noop}
        onAcknowledgeAlert={noop}
      />,
    );

    // spec REQ-SCANNER-ORANGE: label displays translated scanner.trafficOrange
    expect(screen.getByText('Moderación')).toBeInTheDocument();
    // result section has role="status" per ARIA best practice
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders selected food details: name, category, and macros', () => {
    const oliveOil = makeFood({
      id: 'aceite',
      name: 'Aceite de oliva',
      category: 'olive_oil',
      kcalPer100g: 884,
      proteinPer100g: 0,
      carbsPer100g: 0,
      fatPer100g: 100,
    });

    renderWithI18n(
      <ScannerView
        selectedId="aceite"
        options={[{ value: 'aceite', label: 'Aceite de oliva' }]}
        selected={oliveOil}
        result={null}
        safetyAlerts={[]}
        onSelect={noop}
        onClassify={noop}
        onAddToLog={noop}
        onAcknowledgeAlert={noop}
      />,
    );

    // Scope assertions to the food-details section to avoid matching the <option> label
    const details = screen.getByLabelText('Detalles de Aceite de oliva');

    // spec REQ-SCANNER-DETAILS: food name visible
    expect(details).toHaveTextContent('Aceite de oliva');
    // category label from i18n (olive_oil → "AOVE" in es)
    expect(details).toHaveTextContent('AOVE');
    // macros: es format "884 kcal | 0g prot | 0g HC | 100g grasa"
    expect(details).toHaveTextContent(/884 kcal/);
    expect(details).toHaveTextContent(/0g prot/);
    expect(details).toHaveTextContent(/0g HC/);
    expect(details).toHaveTextContent(/100g grasa/);
  });
});
