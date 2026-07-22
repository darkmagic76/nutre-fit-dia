import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileError } from './ProfileError';
import { ValidationError } from '@shared/errors';

describe('ProfileError', () => {
  it('returns null when error is null (renders nothing in DOM)', () => {
    const { container } = render(<ProfileError error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders error message with role="alert" when ValidationError is provided', () => {
    const errorMessage = 'Test validation error message';
    render(<ProfileError error={new ValidationError(errorMessage)} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(errorMessage);
  });
});
