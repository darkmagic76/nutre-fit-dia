import { describe, it, expect } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { clampDragOffset, useDraggablePanel } from './useDraggablePanel';

describe('clampDragOffset', () => {
  it('returns the offset unchanged inside viewport bounds', () => {
    expect(clampDragOffset(100, 50, 1024, 768)).toEqual({ x: 100, y: 50 });
  });

  it('clamps to the exact bound at half-viewport minus margin', () => {
    // viewport 1024x768 → maxX = 512 - 48 = 464, maxY = 384 - 48 = 336
    expect(clampDragOffset(464, 336, 1024, 768)).toEqual({ x: 464, y: 336 });
  });

  it('clamps overflow on every side so the panel stays reachable', () => {
    expect(clampDragOffset(9999, 9999, 1024, 768)).toEqual({ x: 464, y: 336 });
    expect(clampDragOffset(-9999, -9999, 1024, 768)).toEqual({ x: -464, y: -336 });
  });
});

type PanelApi = ReturnType<typeof useDraggablePanel>;

function renderProbe() {
  let api!: PanelApi;
  function Probe() {
    api = useDraggablePanel();
    return (
      <div>
        <div data-testid="drag-handle" {...api.dragHandleProps}>
          handle
        </div>
        <button type="button">inner action</button>
        <div data-testid="drag-panel" style={api.panelStyle} />
      </div>
    );
  }
  const view = render(<Probe />);
  return {
    ...view,
    handle: view.getByTestId('drag-handle'),
    panel: view.getByTestId('drag-panel'),
    getApi: () => api,
  };
}

function dragBy(handle: HTMLElement, fromX: number, fromY: number, toX: number, toY: number) {
  fireEvent.pointerDown(handle, { clientX: fromX, clientY: fromY, button: 0 });
  fireEvent.pointerMove(window, { clientX: toX, clientY: toY });
  fireEvent.pointerUp(window);
}

describe('useDraggablePanel', () => {
  it('starts centered with no transform until the first drag', () => {
    const { getApi, panel } = renderProbe();
    expect(getApi().position).toBeNull();
    expect(getApi().panelStyle).toBeUndefined();
    expect(panel.getAttribute('style')).toBeNull();
  });

  it('moves the panel on handle down/move/up (pointer events)', () => {
    const { getApi, handle, panel } = renderProbe();
    act(() => {
      dragBy(handle, 200, 200, 260, 260);
    });
    expect(getApi().position).toEqual({ x: 60, y: 60 });
    expect(panel.style.transform).toBe('translate(60px, 60px)');
    expect(getApi().isDragging).toBe(false);
  });

  it('clamps the drag offset to viewport bounds', () => {
    const { getApi, handle } = renderProbe();
    act(() => {
      dragBy(handle, 0, 0, 99999, 99999);
    });
    expect(getApi().position).toEqual({
      x: window.innerWidth / 2 - 48,
      y: window.innerHeight / 2 - 48,
    });
  });

  it('ignores moves without a drag start and non-primary buttons', () => {
    const { getApi, handle } = renderProbe();
    act(() => {
      fireEvent.pointerMove(window, { clientX: 500, clientY: 500 });
      fireEvent.pointerDown(handle, { clientX: 0, clientY: 0, button: 1 });
      fireEvent.pointerMove(window, { clientX: 500, clientY: 500 });
      fireEvent.pointerUp(window);
    });
    expect(getApi().position).toBeNull();
  });

  it('never starts a drag from inner buttons', () => {
    const { getApi, getByRole, handle } = renderProbe();
    expect(handle).toBeInTheDocument();
    act(() => {
      fireEvent.pointerDown(getByRole('button', { name: 'inner action' }), {
        clientX: 10,
        clientY: 10,
        button: 0,
      });
      fireEvent.pointerMove(window, { clientX: 400, clientY: 400 });
      fireEvent.pointerUp(window);
    });
    expect(getApi().position).toBeNull();
  });
});
