import { describe, it, expect, beforeEach } from 'vitest';
import { useLogStore, useTrackerStore } from '@shared/stores';
import { FoodCategory } from '@shared/domain';
import { makeFood } from '@/test/fixtures';

const mockFood = makeFood({
  id: 'test-food-1',
  name: 'Pan integral',
  category: FoodCategory.CEREALS,
  gramsPerRation: 40,
  kcalPer100g: 250,
  proteinPer100g: 8,
  carbsPer100g: 45,
  fiberPer100g: 6,
  fatPer100g: 2,
  saturatedFatPer100g: 0.3,
  carbonFootprint: 0.5,
});

describe('logStore', () => {
  beforeEach(() => {
    useLogStore.setState({ todayLog: [], todayValidation: null });
    useTrackerStore.setState({ restrictionActive: false });
  });

  it('starts with empty log', () => {
    const state = useLogStore.getState();
    expect(state.todayLog).toEqual([]);
    expect(state.todayValidation).toBeNull();
  });

  it('adds food to log and validates', () => {
    const { addFoodToLog } = useLogStore.getState();
    addFoodToLog(mockFood);

    const state = useLogStore.getState();
    expect(state.todayLog).toHaveLength(1);
    expect(state.todayLog[0].name).toBe('Pan integral');
    expect(state.todayValidation).not.toBeNull();
  });

  it('removes food from log by index', () => {
    const { addFoodToLog, removeFoodFromLog } = useLogStore.getState();
    addFoodToLog(mockFood);
    addFoodToLog({ ...mockFood, id: 'test-food-2', name: 'AOVE' });

    removeFoodFromLog(0);

    const state = useLogStore.getState();
    expect(state.todayLog).toHaveLength(1);
    expect(state.todayLog[0].id).toBe('test-food-2');
  });

  it('revalidates after removal', () => {
    const { addFoodToLog, removeFoodFromLog } = useLogStore.getState();
    addFoodToLog(mockFood);
    expect(useLogStore.getState().todayValidation).not.toBeNull();

    removeFoodFromLog(0);
    expect(useLogStore.getState().todayValidation).not.toBeNull();
  });

  it('reads restrictionActive from trackerStore cross-feature', () => {
    useTrackerStore.setState({ restrictionActive: true });

    const { addFoodToLog } = useLogStore.getState();
    addFoodToLog(mockFood);
    addFoodToLog({ ...mockFood, id: 'c2', name: 'Pan 2' });
    addFoodToLog({ ...mockFood, id: 'c3', name: 'Pan 3' });
    addFoodToLog({ ...mockFood, id: 'c4', name: 'Pan 4' });
    addFoodToLog({ ...mockFood, id: 'c5', name: 'Pan 5' });

    const state = useLogStore.getState();
    expect(state.todayLog).toHaveLength(5);
    expect(state.todayValidation).not.toBeNull();
  });
});
