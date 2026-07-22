import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithI18n } from '@/test/i18n-test-utils';
import { FoodList } from './FoodList';
import { FoodCategory } from '@shared/domain';
import { makeFood } from '@/test/fixtures';

describe('FoodList', () => {
  it('renders empty state when no foods (ES default)', () => {
    renderWithI18n(<FoodList foods={[]} onRemove={vi.fn()} />);

    expect(screen.getByText('Sin alimentos registrados.')).toBeInTheDocument();
  });

  it('renders food items with name and category', () => {
    const foods = [
      makeFood({ id: '1', name: 'Pan integral', category: FoodCategory.CEREALS }),
      makeFood({ id: '2', name: 'AOVE', category: FoodCategory.OLIVE_OIL }),
    ];

    renderWithI18n(<FoodList foods={foods} onRemove={vi.fn()} />);

    expect(screen.getByText('Pan integral')).toBeInTheDocument();
    expect(screen.getByText(/Cereales/)).toBeInTheDocument();
    expect(screen.getByText('AOVE')).toBeInTheDocument();
  });

  it('calls onRemove with correct index when remove button clicked', async () => {
    const onRemove = vi.fn();
    const foods = [
      makeFood({ id: '1', name: 'Pan integral', category: FoodCategory.CEREALS }),
      makeFood({ id: '2', name: 'AOVE', category: FoodCategory.OLIVE_OIL }),
    ];

    renderWithI18n(<FoodList foods={foods} onRemove={onRemove} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);

    await userEvent.click(buttons[1]);
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('remove button has accessible aria-label (ES default)', () => {
    const foods = [makeFood({ id: '1', name: 'Pan integral', category: FoodCategory.CEREALS })];

    renderWithI18n(<FoodList foods={foods} onRemove={vi.fn()} />);

    const button = screen.getByRole('button', { name: /Eliminar Pan integral del registro/i });
    expect(button).toBeInTheDocument();
  });

  it('renders multiple food items in correct list order', () => {
    const foods = [
      makeFood({ id: '1', name: 'First', category: FoodCategory.CEREALS }),
      makeFood({ id: '2', name: 'Second', category: FoodCategory.VEGETABLES }),
      makeFood({ id: '3', name: 'Third', category: FoodCategory.FRUITS }),
    ];

    renderWithI18n(<FoodList foods={foods} onRemove={vi.fn()} />);

    const list = screen.getByRole('list');
    const items = Array.from(list.querySelectorAll('li'));
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('First');
    expect(items[1]).toHaveTextContent('Second');
    expect(items[2]).toHaveTextContent('Third');
  });

  it('has accessible list label when foods present (ES default)', () => {
    const foods = [makeFood({ id: '1', name: 'Test', category: FoodCategory.CEREALS })];

    renderWithI18n(<FoodList foods={foods} onRemove={vi.fn()} />);

    expect(screen.getByRole('list', { name: /Alimentos registrados hoy/i })).toBeInTheDocument();
  });
});
