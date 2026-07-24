import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithI18n } from '@/test/i18n-test-utils';
import { NutritionalTrafficLightContainer } from './NutritionalTrafficLightContainer';
import { useLogStore } from '@shared/stores';
import { evaluateAndEnqueue } from '@shared/nudge';

// Mock only evaluateAndEnqueue — the container is the sole consumer of this export
vi.mock('@shared/nudge', () => ({
  evaluateAndEnqueue: vi.fn(),
}));

describe('NutritionalTrafficLightContainer', () => {
  beforeEach(() => {
    // Reset log store to empty state before each test
    useLogStore.setState({ todayLog: [] });
    vi.clearAllMocks();
  });

  it('handleClassify selects a food, classifies it, and triggers nudge', async () => {
    const user = userEvent.setup();
    renderWithI18n(<NutritionalTrafficLightContainer />);

    // Select the first food (cereal-pan-integral = "Pan integral")
    const select = screen.getByLabelText('Seleccionar alimento');
    await user.selectOptions(select, 'cereal-pan-integral');

    // Click classify
    await user.click(screen.getByText('Clasificar'));

    // spec REQ-CONTAINER-CLASSIFY: evaluateAndEnqueue called with selected food
    expect(evaluateAndEnqueue).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'cereal-pan-integral' }),
    );

    // Classification result renders (ORANGE → "Moderación")
    expect(screen.getByText('Moderación')).toBeInTheDocument();
  });

  it('handleAddToLog adds food to log store and triggers nudge', async () => {
    const user = userEvent.setup();
    renderWithI18n(<NutritionalTrafficLightContainer />);

    // Select the first food
    const select = screen.getByLabelText('Seleccionar alimento');
    await user.selectOptions(select, 'cereal-pan-integral');

    // Click add-to-log (aria-label "Añadir al registro")
    await user.click(screen.getByLabelText('Añadir al registro'));

    // spec REQ-CONTAINER-LOG: food added to log store
    const log = useLogStore.getState().todayLog;
    expect(log).toHaveLength(1);
    expect(log[0].id).toBe('cereal-pan-integral');

    // spec REQ-CONTAINER-LOG: evaluateAndEnqueue called with no args
    expect(evaluateAndEnqueue).toHaveBeenCalledWith();
  });
});
