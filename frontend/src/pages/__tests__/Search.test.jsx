import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FavoritesProvider } from "../../context/FavoritesContext";
import Search from "../Search";

describe("Search", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows search matches as meal cards with links to their matching category", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        meals: [
          {
            idMeal: "52772",
            strMeal: "Teriyaki Chicken",
            strMealThumb: "https://example.com/chicken.jpg",
            strCategory: "Chicken",
            strArea: "Japanese",
          },
        ],
      }),
    });

    render(
      <MemoryRouter>
        <FavoritesProvider>
          <Search />
        </FavoritesProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Search meals" }), {
      target: { value: "chicken" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByRole("heading", { name: "Teriyaki Chicken" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Chicken recipes" })).toHaveAttribute(
      "href",
      "/categories/Chicken"
    );
    expect(screen.getByRole("link", { name: "View Recipe" })).toHaveAttribute(
      "href",
      "/meal/52772"
    );
    await waitFor(() => {
      expect(screen.getByText("1 recipe")).toBeInTheDocument();
    });
  });
});
