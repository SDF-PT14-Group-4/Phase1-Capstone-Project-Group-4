import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addFavorite,
  clearPlannedDay,
  getFavorites,
  getPlanner,
  removeFavorite,
} from "../services/accountMealService.js";

function response(data, status = 200) {
  return {
    ok: status < 400,
    status,
    json: async () => data,
  };
}

describe("account meal service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads and maps saved favorites back to TheMealDB meal objects", async () => {
    const meal = {
      idMeal: "52772",
      strMeal: "Teriyaki Chicken",
      strMealThumb: "https://example.com/meal.jpg",
      strCategory: "Chicken",
      strArea: "Japanese",
    };
    const fetchMock = vi.fn().mockResolvedValue(
      response({
        favorites: [{
          mealId: meal.idMeal,
          name: meal.strMeal,
          image: meal.strMealThumb,
          category: meal.strCategory,
          cuisine: meal.strArea,
          mealData: meal,
        }],
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getFavorites("account-token")).resolves.toEqual([meal]);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:5000/api/me/favorites",
      expect.objectContaining({
        headers: { Authorization: "Bearer account-token" },
      })
    );
  });

  it("loads the planner and preserves meal details for its cards", async () => {
    const meal = {
      mealId: "52772",
      name: "Teriyaki Chicken",
      mealData: { idMeal: "52772", strMeal: "Teriyaki Chicken" },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({ planner: { monday: [meal], tuesday: [] } })
      )
    );

    await expect(getPlanner("account-token")).resolves.toMatchObject({
      monday: [{ idMeal: "52772", strMeal: "Teriyaki Chicken" }],
      tuesday: [],
    });
  });

  it("sends favorite payloads and deletes a favorite or whole planner day", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        mealId: "52772",
        name: "Teriyaki Chicken",
        mealData: { idMeal: "52772", strMeal: "Teriyaki Chicken" },
      }, 201))
      .mockResolvedValueOnce(response(null, 204))
      .mockResolvedValueOnce(response(null, 204));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      addFavorite("account-token", {
        idMeal: "52772",
        strMeal: "Teriyaki Chicken",
      })
    ).resolves.toMatchObject({ idMeal: "52772" });
    await removeFavorite("account-token", "52772");
    await clearPlannedDay("account-token", "monday");

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      mealId: "52772",
      name: "Teriyaki Chicken",
    });
    expect(fetchMock.mock.calls[1][0]).toBe(
      "http://127.0.0.1:5000/api/me/favorites/52772"
    );
    expect(fetchMock.mock.calls[2][0]).toBe(
      "http://127.0.0.1:5000/api/me/planner/monday"
    );
  });
});
