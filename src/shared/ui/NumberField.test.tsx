import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberField } from './NumberField';

describe('NumberField', () => {
  it('renders with label', () => {
    render(<NumberField id="n" label="Weight" value="80" onChange={() => {}} />);
    expect(screen.getByLabelText('Weight')).toBeInTheDocument();
  });

  it('calls onChange on input', () => {
    const onChange = vi.fn();
    render(<NumberField id="n" label="Weight" value="80" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Weight'), { target: { value: '75' } });
    expect(onChange).toHaveBeenCalledWith('75');
  });

  it('passes min and step attributes', () => {
    render(<NumberField id="n" label="W" value="80" onChange={() => {}} min={30} step="0.1" />);
    const input = screen.getByLabelText('W');
    expect(input).toHaveAttribute('min', '30');
    expect(input).toHaveAttribute('step', '0.1');
  });
});
