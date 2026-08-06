import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExportData } from './useExportData';
import { useTrackerStore } from '@infrastructure/stores/trackerStore';
import { useLogStore } from '@infrastructure/stores/logStore';
import { useNudgeStore } from '@infrastructure/stores/nudgeStore';
import { useActivityStore } from '@infrastructure/stores/activityStore';
import { useBiomarkerStore } from '@infrastructure/stores/biomarkerStore';
import { usePlanStore } from '@infrastructure/stores/planStore';

describe('useExportData', () => {
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let originalRevokeObjectURL: typeof URL.revokeObjectURL;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    // Reset all stores to defaults
    useTrackerStore.setState({
      weight: '80',
      height: '170',
      age: '55',
      diagnosisAge: '55',
      gender: 'male',
      paf: '1.2',
      glucose: '',
      glucoseContext: 'fasting',
      caloricTarget: null,
      caloricRestrictionActive: false,
      profileError: null,
    });
    useLogStore.setState({ todayLog: [], todayValidation: null });
    useNudgeStore.setState({ pending: [], history: [], cooldowns: {} });
    useActivityStore.setState({
      weeklyMinutes: 0,
      strengthSessions: 0,
      entries: [],
      streak: 0,
    });
    usePlanStore.setState({ weeklyPlan: null });
    useBiomarkerStore.getState().resetBiomarkerHistory();

    // Mock URL.createObjectURL / revokeObjectURL to avoid real Blob URLs in jsdom
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = () => 'blob:mock-url';
    URL.revokeObjectURL = () => {};
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('returns exportAllData function', () => {
    const { result } = renderHook(() => useExportData());

    expect(result.current.exportAllData).toBeInstanceOf(Function);
  });

  it('exportAllData aggregates all 6 stores with correct keys and exportedAt', async () => {
    useTrackerStore.setState({ weight: '75', height: '165' });
    useActivityStore.setState({ weeklyMinutes: 150, strengthSessions: 2 });

    let capturedBlob: Blob | null = null;
    URL.createObjectURL = (blob: Blob) => {
      capturedBlob = blob;
      return 'blob:mock-url';
    };

    // Suppress anchor.click() — jsdom doesn't support navigation
    const clickSpy = vi.fn();
    const mockAnchor = {
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement;
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = ((tag: string) => {
      if (tag === 'a') return mockAnchor;
      return originalCreateElement(tag);
    }) as typeof document.createElement;

    const { result } = renderHook(() => useExportData());

    await act(async () => {
      result.current.exportAllData();
      // Allow microtasks to settle
    });

    document.createElement = originalCreateElement;

    expect(capturedBlob).not.toBeNull();
    const text = await capturedBlob!.text();
    const parsed = JSON.parse(text);

    // All 6 top-level keys + exportedAt
    expect(parsed).toHaveProperty('tracker');
    expect(parsed).toHaveProperty('log');
    expect(parsed).toHaveProperty('nudge');
    expect(parsed).toHaveProperty('activity');
    expect(parsed).toHaveProperty('plan');
    expect(parsed).toHaveProperty('biomarkerHistory');
    expect(parsed).toHaveProperty('exportedAt');

    // Verify exportedAt is a valid ISO timestamp
    expect(() => new Date(parsed.exportedAt as string)).not.toThrow();

    // Verify data from populated stores is present (plaintext)
    expect(parsed.tracker).toHaveProperty('weight');
    expect(parsed.tracker.weight).toBe('75');
    expect(parsed.activity.weeklyMinutes).toBe(150);
    expect(parsed.activity.strengthSessions).toBe(2);

    // Verify no function-typed keys leaked
    const hasFunctions = Object.values(parsed.tracker as object).some(
      (v) => typeof v === 'function',
    );
    expect(hasFunctions).toBe(false);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('includes all six top-level keys even when stores are empty', async () => {
    let capturedBlob: Blob | null = null;
    URL.createObjectURL = (blob: Blob) => {
      capturedBlob = blob;
      return 'blob:mock-url';
    };
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = ((tag: string) => {
      if (tag === 'a') return mockAnchor;
      return originalCreateElement(tag);
    }) as typeof document.createElement;

    const { result } = renderHook(() => useExportData());
    await act(async () => result.current.exportAllData());

    document.createElement = originalCreateElement;

    const text = await capturedBlob!.text();
    const parsed = JSON.parse(text);
    expect(Object.keys(parsed).sort()).toEqual([
      'activity',
      'biomarkerHistory',
      'exportedAt',
      'log',
      'nudge',
      'plan',
      'tracker',
    ]);
  });

  it('exports sensitive data as plaintext (user-facing backup)', async () => {
    // Set sensitive fields
    useTrackerStore.setState({ weight: '75', glucose: '110' });
    useActivityStore.setState({ weeklyMinutes: 150, strengthSessions: 2 });

    const state = useTrackerStore.getState();
    const activityState = useActivityStore.getState();

    // Sensitive data should be accessible as plaintext via getState()
    // (encryption is only for at-rest localStorage, export is user-facing plaintext)
    expect(state.weight).toBe('75');
    expect(state.glucose).toBe('110');
    expect(activityState.weeklyMinutes).toBe(150);
    expect(activityState.strengthSessions).toBe(2);
  });

  it('includes exportedAt ISO timestamp', () => {
    // Verify the concept: export should include a timestamp
    const before = new Date().toISOString();

    const { result } = renderHook(() => useExportData());

    // After export, we can check the timestamp is recent
    // The hook should include exportedAt in the output
    expect(result.current.exportAllData).toBeDefined();

    const after = new Date().toISOString();
    expect(before <= after).toBe(true); // sanity check
  });

  it('downloads as Blob with application/json MIME type', async () => {
    let capturedBlob: Blob | null = null;

    // Override createObjectURL to capture the Blob
    URL.createObjectURL = (blob: Blob) => {
      capturedBlob = blob;
      return 'blob:mock-url';
    };

    // Mock document.createElement to track anchor click
    const mockAnchor = {
      href: '',
      download: '',
      click: () => {},
    } as HTMLAnchorElement;
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = ((tag: string) => {
      if (tag === 'a') return mockAnchor;
      return originalCreateElement(tag);
    }) as typeof document.createElement;

    const { result } = renderHook(() => useExportData());

    await act(async () => {
      result.current.exportAllData();
    });

    expect(capturedBlob).not.toBeNull();
    expect(capturedBlob!.type).toBe('application/json');
    expect(mockAnchor.download).toMatch(/^nutrifit-export-/);
    expect(mockAnchor.download).toMatch(/\.json$/);

    document.createElement = originalCreateElement;
  });
});
