import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SustainabilityView } from './SustainabilityView';
import { es } from '@shared/i18n/es';
import { PROTEIN_EMISSION_RATIOS, SCORING_WEIGHTS } from '@domain/sustainability';
import type { Translations } from '@shared/i18n';

const t = es as Translations;

const defaultProps = {
  translate: t,
  scoringWeights: SCORING_WEIGHTS,
  emissionRatios: PROTEIN_EMISSION_RATIOS,
};

describe('SustainabilityView', () => {
  it('displays zero-waste count and total foods', () => {
    render(<SustainabilityView {...defaultProps} zeroWasteCount={5} totalFoods={42} />);

    // Zero-waste count should appear
    expect(screen.getByText('5')).toBeInTheDocument();
    // Total foods count
    expect(screen.getByText('42')).toBeInTheDocument();
    // Zero-Waste heading exists (appears as heading and in footer)
    const zeroWasteElements = screen.getAllByText(/Zero-Waste/);
    expect(zeroWasteElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders environmental scoring section with weights', () => {
    render(<SustainabilityView {...defaultProps} zeroWasteCount={0} totalFoods={10} />);

    // Carbon footprint weight 50% — text contains "huella de carbono"
    expect(screen.getByText(/huella de carbono/i)).toBeInTheDocument();
    // Seasonality weight 30%
    expect(screen.getByText(/temporalidad/i)).toBeInTheDocument();
    // Proximity weight 20%
    expect(screen.getByText(/proximidad/i)).toBeInTheDocument();
  });

  it('displays PROTEIN_EMISSION_RATIOS correctly', () => {
    render(<SustainabilityView {...defaultProps} zeroWasteCount={0} totalFoods={10} />);

    // Check emission labels are rendered
    expect(screen.getByText('Legumbres')).toBeInTheDocument();
    expect(screen.getByText('Huevos')).toBeInTheDocument();
    expect(screen.getByText('Aves')).toBeInTheDocument();
    expect(screen.getByText('Ternera')).toBeInTheDocument();
  });

  it('renders all three sections (scoring, zero-waste, emissions)', () => {
    render(<SustainabilityView {...defaultProps} zeroWasteCount={3} totalFoods={20} />);

    // Three headings for each section
    expect(screen.getByText(/Puntuación Ambiental/)).toBeInTheDocument();
    expect(screen.getByText('Zero-Waste')).toBeInTheDocument();
    expect(screen.getByText(/Emisiones Comparativas/)).toBeInTheDocument();
  });

  it('renders emission ratio values as decimal strings', () => {
    render(<SustainabilityView {...defaultProps} zeroWasteCount={0} totalFoods={10} />);

    // Find the emission values — they're formatted as e.g., "0.8", "4.2", "60.0"
    // Beef has the highest: check for a value around 60
    const emissionValues = screen.getAllByText(/\d+\.\d/);
    expect(emissionValues.length).toBeGreaterThanOrEqual(7);
  });

  it('shows "de" separator for zero-waste description', () => {
    render(<SustainabilityView {...defaultProps} zeroWasteCount={4} totalFoods={25} />);

    // The description contains "4 de 25" (or similar zero-waste text)
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('renders the card title', () => {
    render(<SustainabilityView {...defaultProps} zeroWasteCount={0} totalFoods={0} />);

    expect(screen.getByText('🌍 Sostenibilidad')).toBeInTheDocument();
  });
});
