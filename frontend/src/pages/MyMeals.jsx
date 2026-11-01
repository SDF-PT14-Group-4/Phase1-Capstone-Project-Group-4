import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import SignInPrompt from "../components/common/SignInPrompt.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import {
  MAX_INGREDIENTS,
  createMeal,
  deleteMeal,
  listMyMeals,
  updateMeal,
} from "../services/customMealService.js";
import "../styles/components/account.css";

const EMPTY_FORM = {
  name: "",
  category: "",
  cuisine: "",
  image: "",
  instructions: "",
  isPublic: false,
  ingredients: [{ ingredient: "", measure: "" }],
};

function formFromMeal(meal) {
  return {
    name: meal.name,
    category: meal.category || "",
    cuisine: meal.cuisine || "",
    image: meal.image || "",
    instructions: meal.instructions || "",
    isPublic: Boolean(meal.isPublic),
    ingredients: meal.ingredients?.length
      ? meal.ingredients.map((item) => ({
          ingredient: item.ingredient || "",
          measure: item.measure || "",
        }))
      : [{ ingredient: "", measure: "" }],
  };
}

function payloadFromForm(form) {
  return {
    name: form.name.trim(),
    category: form.category.trim(),
    cuisine: form.cuisine.trim(),
    image: form.image.trim(),
    instructions: form.instructions.trim(),
    isPublic: form.isPublic,
    ingredients: form.ingredients
      .map((item) => ({
        ingredient: item.ingredient.trim(),
        measure: item.measure.trim(),
      }))
      .filter((item) => item.ingredient),
  };
}

function MyMealsContent() {
  const { accessToken } = useAuth();

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadMeals = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setMeals(await listMyMeals(accessToken));
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    // Initial fetch; state is set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMeals();
  }, [loadMeals]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateIngredient(index, field, value) {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((item, position) =>
        position === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addIngredient() {
    setForm((current) =>
      current.ingredients.length >= MAX_INGREDIENTS
        ? current
        : {
            ...current,
            ingredients: [...current.ingredients, { ingredient: "", measure: "" }],
          }
    );
  }

  function removeIngredient(index) {
    setForm((current) => {
      const remaining = current.ingredients.filter((_, position) => position !== index);
      return {
        ...current,
        ingredients: remaining.length ? remaining : [{ ingredient: "", measure: "" }],
      };
    });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError("");
  }

  function startEditing(meal) {
    setForm(formFromMeal(meal));
    setEditingId(meal.id);
    setFormError("");
    setStatus("");
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setStatus("");

    const payload = payloadFromForm(form);
    if (!payload.name) {
      setFormError("Give your meal a name.");
      return;
    }

    setSaving(true);
    try {
      if (editingId === null) {
        await createMeal(accessToken, payload);
        setStatus(`"${payload.name}" was added. You can now plan it from the Planner.`);
      } else {
        await updateMeal(accessToken, editingId, payload);
        setStatus(`"${payload.name}" was updated.`);
      }
      resetForm();
      await loadMeals();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(meal) {
    setStatus("");
    try {
      await deleteMeal(accessToken, meal.id);
      setPendingDelete(null);
      if (editingId === meal.id) resetForm();
      setStatus(`"${meal.name}" was deleted.`);
      await loadMeals();
    } catch (error) {
      setPendingDelete(null);
      setLoadError(error.message);
    }
  }

  return (
    <main className="account-page">
      <header>
        <h1>My meals</h1>
        <p className="account-lead">
          Create your own recipes and plan them next to the meals you find here.
          Meals are private unless you choose to share them.
        </p>
      </header>

      <section className="account-card" aria-labelledby="my-meal-form-title">
        <h2 id="my-meal-form-title">
          {editingId === null ? "Add a meal" : "Edit meal"}
        </h2>
        <form className="account-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="meal-name">Meal name</label>
          <input
            id="meal-name"
            type="text"
            maxLength={255}
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />

          <label htmlFor="meal-category">Category</label>
          <input
            id="meal-category"
            type="text"
            maxLength={120}
            placeholder="For example Salad"
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
          />

          <label htmlFor="meal-cuisine">Cuisine</label>
          <input
            id="meal-cuisine"
            type="text"
            maxLength={120}
            placeholder="For example Mexican"
            value={form.cuisine}
            onChange={(event) => updateField("cuisine", event.target.value)}
          />

          <fieldset>
            <legend>Ingredients</legend>
            {form.ingredients.map((item, index) => (
              <div className="ingredient-row" key={index}>
                <input
                  type="text"
                  aria-label={`Ingredient ${index + 1}`}
                  maxLength={120}
                  placeholder="Ingredient"
                  value={item.ingredient}
                  onChange={(event) =>
                    updateIngredient(index, "ingredient", event.target.value)
                  }
                />
                <input
                  type="text"
                  aria-label={`Amount for ingredient ${index + 1}`}
                  maxLength={120}
                  placeholder="Amount"
                  value={item.measure}
                  onChange={(event) =>
                    updateIngredient(index, "measure", event.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  aria-label={`Remove ingredient ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="account-button"
              onClick={addIngredient}
              disabled={form.ingredients.length >= MAX_INGREDIENTS}
            >
              Add ingredient
            </button>
          </fieldset>

          <label htmlFor="meal-instructions">Instructions</label>
          <textarea
            id="meal-instructions"
            maxLength={5000}
            value={form.instructions}
            onChange={(event) => updateField("instructions", event.target.value)}
          />

          <label htmlFor="meal-image">Image web address (optional)</label>
          <input
            id="meal-image"
            type="url"
            maxLength={500}
            placeholder="https://..."
            value={form.image}
            onChange={(event) => updateField("image", event.target.value)}
          />

          <div className="chip-group">
            <label htmlFor="meal-public">
              <input
                id="meal-public"
                type="checkbox"
                checked={form.isPublic}
                onChange={(event) => updateField("isPublic", event.target.checked)}
              />
              <span>Share publicly so other cooks can see this meal</span>
            </label>
          </div>

          {formError && (
            <p className="account-error" role="alert">
              {formError}
            </p>
          )}

          <div className="custom-meal-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId === null
                  ? "Add meal"
                  : "Save changes"}
            </button>
            {editingId !== null && (
              <button type="button" className="account-button" onClick={resetForm}>
                Cancel editing
              </button>
            )}
          </div>
        </form>
      </section>

      {status && (
        <p className="account-success" role="status">
          {status}
        </p>
      )}
      {loadError && (
        <p className="account-error" role="alert">
          {loadError}
        </p>
      )}

      <section aria-labelledby="my-meal-list-title">
        <h2 id="my-meal-list-title">Your meals</h2>
        {loading ? (
          <LoadingState label="Loading your meals..." />
        ) : meals.length === 0 ? (
          <p className="account-hint">
            You have not added any meals yet. Use the form above to create your first one.
          </p>
        ) : (
          <ul className="custom-meal-list">
            {meals.map((meal) => (
              <li className="custom-meal-item" key={meal.id}>
                {meal.image ? (
                  <img className="custom-meal-thumb" src={meal.image} alt="" />
                ) : (
                  <div className="custom-meal-thumb" aria-hidden="true" />
                )}
                <div>
                  <h3>
                    {meal.name}
                    <span className="custom-meal-badge">
                      {meal.isPublic ? "Public" : "Private"}
                    </span>
                  </h3>
                  <p className="custom-meal-meta">
                    {[meal.category, meal.cuisine].filter(Boolean).join(" · ") ||
                      "No category"}
                    {" · "}
                    {meal.ingredients.length}{" "}
                    {meal.ingredients.length === 1 ? "ingredient" : "ingredients"}
                  </p>

                  {pendingDelete === meal.id ? (
                    <div className="custom-meal-actions" role="group" aria-label={`Confirm deleting ${meal.name}`}>
                      <span>Delete this meal and remove it from your plan?</span>
                      <button
                        type="button"
                        className="account-danger-button"
                        onClick={() => handleDelete(meal)}
                      >
                        Yes, delete
                      </button>
                      <button type="button" onClick={() => setPendingDelete(null)}>
                        Keep it
                      </button>
                    </div>
                  ) : (
                    <div className="custom-meal-actions">
                      <Link to={`/meal/${meal.mealId}`}>View</Link>
                      <button type="button" onClick={() => startEditing(meal)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => setPendingDelete(meal.id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default function MyMeals() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <main className="account-page">
        <SignInPrompt
          title="Sign in to create your own meals"
          message="Write your own recipes, keep them private or share them, and plan them alongside the rest of the menu."
        />
      </main>
    );
  }

  return <MyMealsContent />;
}
