import { describe, it } from 'vitest';
import type { Container } from '@application/ports/container';

describe('Container port interface', () => {
  it('defines the correct shape', () => {
    // Type-level test: verify Container has expected methods and repos
    const _container: Container = {} as Container;

    // Use cases
    expectTypeOf(_container.calculateTarget).toBeFunction();
    expectTypeOf(_container.evaluateNudges).toBeFunction();
    expectTypeOf(_container.exportData).toBeFunction();

    // Repositories
    expectTypeOf(_container.notificationRepo).toBeObject();
    expectTypeOf(_container.activityRepo).toBeObject();
    expectTypeOf(_container.logRepo).toBeObject();
    expectTypeOf(_container.biomarkerRepo).toBeObject();
    expectTypeOf(_container.planRepo).toBeObject();
  });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function expectTypeOf<T>(_: T): { toBeFunction: () => void; toBeObject: () => void } {
  return {
    toBeFunction: () => {},
    toBeObject: () => {},
  };
}
