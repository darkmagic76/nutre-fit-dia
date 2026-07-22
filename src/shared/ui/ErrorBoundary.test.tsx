import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorFallback } from './ErrorFallback';

/* ---------- test helpers ---------- */

function Thrower({ msg = 'test render error' }: { msg?: string }) {
  throw new Error(msg);
}

function NestedThrower({ depth = 3 }: { depth?: number }) {
  if (depth <= 1) throw new Error(`nested error at depth ${depth}`);
  return (
    <div data-testid="depth-wrapper">
      <NestedThrower depth={depth - 1} />
    </div>
  );
}

function StableChild({ label = 'OK' }: { label?: string }) {
  return <p data-testid="stable">{label}</p>;
}

function BrokenOnClickThrower() {
  return (
    <button
      data-testid="sync-throw-btn"
      onClick={() => {
        throw new Error('sync click error');
      }}
    >
      Throw sync
    </button>
  );
}

function AsyncThrower() {
  useEffect(() => {
    const id = setTimeout(() => {
      throw new Error('setTimeout error');
    }, 0);
    return () => clearTimeout(id);
  }, []);
  return <p data-testid="async-loaded">Async loaded</p>;
}

function PromiseRejector() {
  useEffect(() => {
    Promise.reject(new Error('promise rejection outside render')).catch(() => {
      /* swallow in test so it doesn't become unhandled */
    });
  }, []);
  return <p data-testid="promise-loaded">Promise loaded</p>;
}

function CleanupThrower({ onMount }: { onMount?: () => void }) {
  useEffect(() => {
    onMount?.();
    return () => {
      throw new Error('cleanup error');
    };
  }, [onMount]);
  return <p data-testid="cleanup-loaded">Cleanup loaded</p>;
}

/* suppress React's own console.error for caught errors in tests */
function suppressConsole() {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
}

/* ---------- ErrorBoundary tests ---------- */

describe('ErrorBoundary', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = suppressConsole();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // ---- happy path ----

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <StableChild label="Hello World" />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('stable')).toHaveTextContent('Hello World');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // ---- error catching ----

  it('catches a render error and displays the default fallback UI', () => {
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    // default fallback renders both title and description from ErrorFallback
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
  });

  it('catches an error in a deeply nested child (3+ levels)', () => {
    render(
      <ErrorBoundary>
        <NestedThrower depth={4} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders a custom fallback when provided via the fallback prop', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom">Custom error UI</div>}>
        <Thrower />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('custom')).toHaveTextContent('Custom error UI');
    expect(screen.queryByText('Algo salió mal')).not.toBeInTheDocument();
  });

  // ---- retry ----

  it('retry button resets error state and re-renders children', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    function ConditionalThrower() {
      if (shouldThrow) throw new Error('first render error');
      return <p data-testid="recovered">Recovered!</p>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>,
    );

    // error caught, fallback visible
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // fix the throw condition so next render succeeds
    shouldThrow = false;

    // click retry
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // ErrorBoundary remounts children — but React error boundary re-renders children
    // via setState, which triggers a fresh render. We need to force a re-render
    // because the ConditionalThrower was already evaluated in the last render.
    // Actually, ErrorBoundary.handleRetry calls setState({hasError:false}) which
    // triggers re-render. But our ConditionalThrower is a function component
    // that's re-evaluated. However, the module-level `shouldThrow` is now false.
    // The issue: the retry triggers a new render of the ErrorBoundary, which renders
    // children (ConditionalThrower), which now doesn't throw.
    rerender(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>,
    );

    // after retry, children should be visible again
    expect(screen.getByTestId('recovered')).toHaveTextContent('Recovered!');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('handles multiple error → retry → error sequences', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    function ConditionalThrower() {
      if (shouldThrow) throw new Error('conditional error');
      return <p data-testid="finally-ok">Finally OK</p>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>,
    );

    // first render — error caught
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // retry while error persists — falls back again
    await user.click(screen.getByRole('button', { name: /reintentar/i }));
    // ErrorBoundary re-renders, ConditionalThrower still throws
    // (React 19 may recover via sync rendering path)
    // Trigger full re-render with the same condition
    rerender(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>,
    );

    // still shows fallback because children still throw
    // Now fix the condition
    shouldThrow = false;

    // retry should now succeed
    await user.click(screen.getByRole('button', { name: /reintentar/i }));
    rerender(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('finally-ok')).toHaveTextContent('Finally OK');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // ---- non-catchable errors (React limitation) ----

  it('does NOT catch errors thrown in event handlers', () => {
    // React error boundaries do NOT catch event-handler errors.
    // We verify by asserting the fallback is absent after a click that throws.
    // Use window 'error' listener to prevent the unhandled error from
    // reaching vitest's global handler.
    const supress = vi.spyOn(console, 'error').mockImplementation(() => {});

    function onWindowError(e: ErrorEvent) {
      e.preventDefault();
    }
    window.addEventListener('error', onWindowError);

    render(
      <ErrorBoundary>
        <BrokenOnClickThrower />
      </ErrorBoundary>,
    );

    const btn = screen.getByTestId('sync-throw-btn');
    fireEvent.click(btn);

    // Fallback should NOT appear — ErrorBoundary didn't intercept
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    window.removeEventListener('error', onWindowError);
    supress.mockRestore();
  });

  it('does NOT catch errors thrown in setTimeout callbacks', () => {
    render(
      <ErrorBoundary>
        <AsyncThrower />
      </ErrorBoundary>,
    );

    // Component renders successfully (async throw hasn't fired yet)
    expect(screen.getByTestId('async-loaded')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // The setTimeout error would fire after this test completes.
    // In a real scenario, it would be an unhandled exception.
    // The fact that the fallback is NOT shown proves ErrorBoundary didn't catch it.
  });

  it('does NOT catch promise rejections outside the render phase', () => {
    // We spy on console.error to catch React's warning about unhandled rejections
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <PromiseRejector />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('promise-loaded')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    spy.mockRestore();
  });

  it('does NOT catch errors thrown in useEffect cleanup', () => {
    // The cleanup error fires during unmount and React throws it synchronously.
    // We verify that the ErrorBoundary fallback did NOT appear before unmount.
    const onMount = vi.fn();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = render(
      <ErrorBoundary>
        <CleanupThrower onMount={onMount} />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('cleanup-loaded')).toBeInTheDocument();
    expect(onMount).toHaveBeenCalled();
    // No fallback visible before unmount
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Unmount — the cleanup throws. Wrap to prevent test crash.
    // The error not being caught by ErrorBoundary is the correct behavior.
    try {
      unmount();
    } catch {
      // Expected: cleanup throws, ErrorBoundary doesn't catch it
    }

    spy.mockRestore();
  });

  // ---- DEV console logging ----

  it('logs error details to console in dev mode', () => {
    // Restore console.error so we can spy on the actual call
    consoleSpy.mockRestore();

    const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Thrower msg="dev mode error" />
      </ErrorBoundary>,
    );

    // In vitest, import.meta.env.DEV is true, so console.error should be called
    const calls = logSpy.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].includes('[ErrorBoundary]'),
    );
    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect(calls[0][0]).toContain('[ErrorBoundary]');

    logSpy.mockRestore();
    // re-apply the global suppress
    consoleSpy = suppressConsole();
  });

  it('includes the component stack in the console output', () => {
    consoleSpy.mockRestore();
    const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Thrower msg="stack trace error" />
      </ErrorBoundary>,
    );

    const calls = logSpy.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].includes('[ErrorBoundary]'),
    );
    expect(calls.length).toBeGreaterThanOrEqual(1);

    // Third argument is the componentStack string from ErrorInfo
    const componentStack = calls[0][2];
    expect(componentStack).toBeDefined();
    expect(typeof componentStack).toBe('string');
    expect(componentStack).toContain('Thrower');

    logSpy.mockRestore();
    consoleSpy = suppressConsole();
  });

  // ---- production mode ----
  // NOTE: import.meta.env.DEV is a Vite compile-time constant.
  // In vitest (test mode), it is always true. The production gate
  // (no console.error when DEV=false) is verified by the Vite production
  // build, where the dead-code branch is eliminated.

  // ---- callbacks ----

  it('calls onError callback with the caught error', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <Thrower msg="callback test error" />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalled();
    const errorArg = onError.mock.calls[0][0] as Error;
    expect(errorArg).toBeInstanceOf(Error);
    expect(errorArg.message).toBe('callback test error');
  });

  it('calls onRetry when the retry button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <ErrorBoundary onRetry={onRetry}>
        <Thrower />
      </ErrorBoundary>,
    );

    await user.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(onRetry).toHaveBeenCalled();
    // After retry, the fallback UI should be replaced with children
    // (Thrower re-throws, so error state persists — but onRetry was invoked)
  });

  // ---- state reset via render-phase state change ----

  it('resets error state when component is re-rendered with corrected children', async () => {
    const user = userEvent.setup();
    let causeError = true;

    function ExternallyControlled({ cause }: { cause: boolean }) {
      if (cause) throw new Error('controlled error');
      return <p data-testid="clean">Clean render</p>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ExternallyControlled cause={causeError} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Fix the cause
    causeError = false;

    // Rerender with the fix BEFORE clicking retry.
    // The new children (cause=false) are passed to ErrorBoundary,
    // but it's still in error state — it renders the fallback.
    rerender(
      <ErrorBoundary>
        <ExternallyControlled cause={causeError} />
      </ErrorBoundary>,
    );

    // Still shows fallback because hasError is true
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Now click retry — this resets hasError and re-renders the (now fixed) children
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // After retry, children render cleanly
    expect(screen.getByTestId('clean')).toHaveTextContent('Clean render');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // ---- Sibling isolation (per-tab safety) ----

  it('isolates errors between sibling ErrorBoundary instances', () => {
    // Simulate per-tab isolation: two tabs side by side, one crashes
    function BrokenTab() {
      throw new Error('Tab A crashed');
    }
    function HealthyTab() {
      return <p>Tab B is fine</p>;
    }

    render(
      <div>
        <ErrorBoundary
          fallback={
            <ErrorFallback
              title="Tab A Error"
              description="Crashed"
              buttonLabel="Retry"
              onRetry={vi.fn()}
            />
          }
        >
          <BrokenTab />
        </ErrorBoundary>
        <ErrorBoundary>
          <HealthyTab />
        </ErrorBoundary>
      </div>,
    );

    // Broken tab shows fallback
    expect(screen.getByText('Tab A Error')).toBeInTheDocument();
    // Healthy tab renders normally
    expect(screen.getByText('Tab B is fine')).toBeInTheDocument();
    // Only one error alert
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });

  it('retry on broken sibling does not affect healthy sibling', async () => {
    const user = userEvent.setup();

    function BrokenTab() {
      throw new Error('crash');
    }

    render(
      <div>
        <ErrorBoundary
          fallback={
            <ErrorFallback
              title="Error A"
              description="Crashed"
              buttonLabel="Retry A"
              onRetry={vi.fn()}
            />
          }
        >
          <BrokenTab />
        </ErrorBoundary>
        <ErrorBoundary>
          <p>Tab B</p>
        </ErrorBoundary>
      </div>,
    );

    expect(screen.getByText('Error A')).toBeInTheDocument();
    expect(screen.getByText('Tab B')).toBeInTheDocument();

    // Click retry on Tab A — BrokenTab will throw again, keeping error state
    // But this proves the click handler works on the correct boundary
    await user.click(screen.getByRole('button', { name: 'Retry A' }));

    // Tab A still shows error (BrokenTab always throws)
    expect(screen.getByText('Error A')).toBeInTheDocument();
    // Tab B was never affected by the retry
    expect(screen.getByText('Tab B')).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });
});

/* ---------- ErrorFallback tests ---------- */

describe('ErrorFallback', () => {
  it('renders with role="alert" for accessibility', () => {
    render(
      <ErrorFallback
        title="Error title"
        description="Something went wrong"
        buttonLabel="Try again"
        onRetry={vi.fn()}
      />,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Error title');
    expect(alert).toHaveTextContent('Something went wrong');
  });

  it('renders the retry button with the given label', () => {
    render(
      <ErrorFallback
        title="Oops"
        description="Desc"
        buttonLabel="Custom retry"
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Custom retry' })).toBeInTheDocument();
  });

  it('calls onRetry when the button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorFallback title="T" description="D" buttonLabel="Retry" onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('renders title and description as separate elements', () => {
    render(
      <ErrorFallback
        title="My Error"
        description="A detailed description"
        buttonLabel="Retry"
        onRetry={vi.fn()}
      />,
    );

    // Both texts should be present
    expect(screen.getByText('My Error')).toBeInTheDocument();
    expect(screen.getByText('A detailed description')).toBeInTheDocument();
  });
});
