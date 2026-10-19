import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchMeals, getMealById } from '../services/mealService';

describe('mealService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('searches meals by keyword', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ meals: [{ idMeal: '52772', strMeal: 'Teriyaki Chicken' }] }),
    });

    const meals = await searchMeals('chicken');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.themealdb.com/api/json/v1/1/search.php?s=chicken'
    );
    expect(meals).toHaveLength(1);
    expect(meals[0].strMeal).toBe('Teriyaki Chicken');
  });

  it('loads a meal by id', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ meals: [{ idMeal: '52772', strMeal: 'Teriyaki Chicken' }] }),
    });

    const meal = await getMealById('52772');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.themealdb.com/api/json/v1/1/lookup.php?i=52772'
    );
    expect(meal).toMatchObject({ idMeal: '52772', strMeal: 'Teriyaki Chicken' });
  });
});
