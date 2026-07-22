import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectField } from './SelectField';

describe('SelectField', () => {
  const options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ];

  it('renders options', () => {
    render(<SelectField id="s" label="Pick" options={options} value="" onChange={() => {}} />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('shows placeholder when provided', () => {
    render(
      <SelectField
        id="s"
        label="Pick"
        options={options}
        value=""
        onChange={() => {}}
        placeholder="---"
      />,
    );
    expect(screen.getByText('---')).toBeInTheDocument();
  });

  it('calls onChange with selected value', () => {
    const onChange = vi.fn();
    render(<SelectField id="s" label="Pick" options={options} value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Pick'), { target: { value: 'b' } });
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
