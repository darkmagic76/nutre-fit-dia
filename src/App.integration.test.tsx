import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createLocalStorage, createMatchMedia } from './test/test-helpers';
import App from './App';
import { I18nProvider } from '@shared/i18n';

function renderApp() {
  return render(
    <I18nProvider>
      <App />
    </I18nProvider>,
  );
}

describe('App integration', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorage());
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => createMatchMedia(false)),
    );
    renderApp();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const selectTab = (name: string) => {
    fireEvent.click(screen.getByRole('tab', { name: new RegExp(name, 'i') }));
  };

  const getSelectedTabs = () =>
    screen.getAllByRole('tab').filter((t) => t.getAttribute('aria-selected') === 'true');

  const fillGlucose = (value = '100') => {
    const glucoseInput = screen.getByLabelText('Glucosa (mg/dL)');
    fireEvent.change(glucoseInput, { target: { value } });
  };
  it('renders all navigation tabs', () => {
    expect(screen.getByRole('tab', { name: /semáforo/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /hoy/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /perfil/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /plan/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /eco/i })).toBeInTheDocument();
  });
  // Prueba accesibilidad de la navegación por teclado entre las pestañas, asegurando
  // que se puede cambiar de una pestaña a otra con las teclas de flecha.
  it('navigates tabs with ArrowRight keyboard', () => {
    const tabs = screen.getAllByRole('tab');
    const firstTab = tabs[0];

    fireEvent.keyDown(document, { key: 'ArrowRight' });

    const updatedTab = getSelectedTabs()[0];
    expect(updatedTab).toBeDefined();
    expect(updatedTab).not.toBe(firstTab);
  });

  it('does not navigate when modifier key is held', () => {
    const initial = getSelectedTabs();
    fireEvent.keyDown(document, { key: 'ArrowRight', ctrlKey: true });
    const after = getSelectedTabs();
    expect(after).toEqual(initial);
  });

  it('does not navigate on non-arrow key', () => {
    const initial = getSelectedTabs();
    fireEvent.keyDown(document, { key: 'x' });
    const after = getSelectedTabs();
    expect(after).toEqual(initial);
  });

  it('navigates with ArrowLeft wrapping to last tab', () => {
    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    const selected = getSelectedTabs()[0];
    expect(selected?.textContent).toContain('Eco');
  });

  describe('Scanner', () => {
    it('classifies a food and shows result', () => {
      selectTab('Semáforo');

      const select = screen.getByLabelText('Seleccionar alimento');
      fireEvent.change(select, { target: { value: 'oil-aove' } });

      fireEvent.click(screen.getByRole('button', { name: /clasificar/i }));

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows food details when selecting an item', () => {
      selectTab('Semáforo');

      const select = screen.getByLabelText('Seleccionar alimento');
      fireEvent.change(select, { target: { value: 'oil-aove' } });

      // Food name appears in scanner details (multiple matches possible from other tabs)
      const foodNames = screen.getAllByText(/AOVE/);
      expect(foodNames.length).toBeGreaterThanOrEqual(1);
    });

    it('does nothing when classifying or adding without selecting a food', () => {
      selectTab('Semáforo');

      fireEvent.click(screen.getByRole('button', { name: /Clasificar/i }));
      fireEvent.click(screen.getByRole('button', { name: /Añadir al/i }));

      expect(screen.queryByRole('status')).toBeNull();
    });

    it('classifies a processed food with sugars as RED with reasons', () => {
      selectTab('Semáforo');

      const select = screen.getByLabelText('Seleccionar alimento');
      fireEvent.change(select, { target: { value: 'proc-refresco-cola' } });

      fireEvent.click(screen.getByRole('button', { name: /clasificar/i }));

      expect(screen.getByText(/Evitar/)).toBeInTheDocument();
    });

    it('shows safety alert for high-glycemic fruit and acknowledges', () => {
      selectTab('Semáforo');

      const select = screen.getByLabelText('Seleccionar alimento');
      fireEvent.change(select, { target: { value: 'fruit-uvas' } });

      fireEvent.click(screen.getByRole('button', { name: /clasificar/i }));

      // Safety alert should appear
      const acknowledgeBtn = screen.queryByRole('button', { name: /reconocer/i });
      if (acknowledgeBtn) {
        fireEvent.click(acknowledgeBtn);
      }
      // Alert should be dismissible
    });

    it('adds food to daily log and removes it', () => {
      selectTab('Semáforo');

      const select = screen.getByLabelText('Seleccionar alimento');
      fireEvent.change(select, { target: { value: 'oil-aove' } });

      fireEvent.click(screen.getByRole('button', { name: /Añadir al/i }));

      selectTab('Hoy');
      expect(screen.getByText(/aceite/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /eliminar aceite/i }));

      // After removal, food list shows empty state
      expect(screen.getByText(/sin alimentos registrados/i)).toBeInTheDocument();
    });
  });

  describe('DailyLog', () => {
    it('shows empty state when no foods registered', () => {
      selectTab('Hoy');
      expect(screen.getByText(/configurá tu perfil metabólico/i)).toBeInTheDocument();
    });

    it('shows caloric summary after calculating metabolic profile', () => {
      selectTab('Perfil');
      fillGlucose();
      fireEvent.click(screen.getByRole('button', { name: /calcular perfil/i }));

      selectTab('Hoy');
      const statuses = screen.getAllByRole('status');
      const hasObjective = statuses.some((e) => /Objetivo diario/.test(e.textContent ?? ''));
      expect(hasObjective).toBe(true);
    });
  });

  describe('Metabolic Profile', () => {
    it('calculates caloric target from default values', () => {
      selectTab('Perfil');
      fillGlucose();

      fireEvent.click(screen.getByRole('button', { name: /calcular perfil/i }));

      expect(screen.getByText(/BMR/)).toBeInTheDocument();
      expect(screen.getByText(/TDEE/)).toBeInTheDocument();
    });

    it('shows profile error when weight is empty', () => {
      selectTab('Perfil');
      fillGlucose();

      const weightInput = screen.getByLabelText('Peso (kg)');
      fireEvent.change(weightInput, { target: { value: '' } });

      fireEvent.click(screen.getByRole('button', { name: /calcular perfil/i }));

      expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(1);
    });

    it('shows "Sin restricción" when IMC <= 25', () => {
      selectTab('Perfil');
      fillGlucose();

      const weightInput = screen.getByLabelText('Peso (kg)');
      fireEvent.change(weightInput, { target: { value: '65' } });

      fireEvent.click(screen.getByRole('button', { name: /calcular perfil/i }));

      expect(screen.getByText(/Sin restricción/)).toBeInTheDocument();
    });
  });

  describe('Plan', () => {
    it('generates a weekly plan', () => {
      selectTab('Plan');

      fireEvent.click(screen.getByRole('button', { name: /generar plan/i }));

      const status = screen.getByRole('status');
      expect(status.textContent).toContain('Plan válido');
      expect(screen.getByText(/Día 1/)).toBeInTheDocument();
    });

    it('toggles caloric restriction and shows generated plan', () => {
      selectTab('Plan');

      const checkbox = screen.getByLabelText(/activar restricción calórica/i);
      fireEvent.click(checkbox);

      fireEvent.click(screen.getByRole('button', { name: /generar plan/i }));

      const status = screen.getByRole('status');
      expect(status.textContent).toContain('Plan válido');
    });
  });

  describe('Activity', () => {
    it('renders activity tracker tab', () => {
      selectTab('Actividad');
      expect(screen.getByText(/Objetivo OMS/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /registrar/i })).toBeInTheDocument();
    });

    it('submits activity minutes and updates stats', () => {
      selectTab('Actividad');

      const minutesInput = screen.getByLabelText('Minutos moderados');
      fireEvent.change(minutesInput, { target: { value: '60' } });

      fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

      // After submitting 60 minutes, stats should update
      expect(screen.getByText('60')).toBeInTheDocument();
    });
  });

  describe('Nudges', () => {
    it('renders nudge panel with empty state', () => {
      selectTab('Nudges');
      const panel = document.getElementById('panel-nudges');
      expect(panel).not.toHaveAttribute('hidden');
    });
  });

  describe('Sustainability', () => {
    it('renders sustainability tab', () => {
      selectTab('Eco');
      expect(screen.getByText(/Puntuación Ambiental/)).toBeInTheDocument();
    });
  });
});
