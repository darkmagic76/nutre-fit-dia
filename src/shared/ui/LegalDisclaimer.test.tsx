import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LegalDisclaimer } from './LegalDisclaimer';

describe('LegalDisclaimer', () => {
  it('renders the legal disclaimer text', () => {
    render(<LegalDisclaimer />);
    expect(screen.getByText(/dietista-nutricionista colegiado/)).toBeInTheDocument();
  });

  it('has alert role for accessibility', () => {
    render(<LegalDisclaimer />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
