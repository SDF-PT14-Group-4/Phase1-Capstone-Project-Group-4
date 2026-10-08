import { beforeEach, describe, expect, it, vi } from "vitest";
import { readStorage, STORAGE_KEYS, writeStorage } from "../utils/storage";

describe("storage utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("uses stable keys for basket and planner state", () => {
    expect(STORAGE_KEYS).toEqual({
      basket: "mealBasket",
      planner: "weeklyPlanner",
    });
  });

  it("round-trips JSON values through local storage", () => {
    const value = [{ id: "meal-1", quantity: 2 }];

    writeStorage(STORAGE_KEYS.basket, value);

    expect(readStorage(STORAGE_KEYS.basket, [])).toEqual(value);
  });

  it("returns the fallback for missing or invalid stored values", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(readStorage("missing", { empty: true })).toEqual({ empty: true });
    localStorage.setItem("broken", "{");
    expect(readStorage("broken", [])).toEqual([]);
    expect(error).toHaveBeenCalledOnce();
  });
});
