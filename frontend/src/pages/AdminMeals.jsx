import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import {
  getAdminMeals,
  createAdminMeal,
  updateAdminMeal,
  deleteAdminMeal,
} from "../services/adminMealService";
import "./AdminMeals.css";

const emptyForm = {
  name: "",
  image: "",
  category: "",
  cuisine: "",
};

function AdminMeals() {
  const { isAuthenticated, accessToken } = useAuth();

  const [meals, setMeals] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(isAuthenticated && Boolean(accessToken));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
  if (!isAuthenticated || !accessToken) {
    return;
  }

  async function loadMeals() {
    try {
      setLoading(true);
      setError("");
      setAccessDenied(false);

      const results = await getAdminMeals(accessToken);
      setMeals(results);
    } catch (err) {
      if (err.message === "Admin access required.") {
        setAccessDenied(true);
      } else {
        setError(err.message || "Unable to load meals.");
      }
    } finally {
      setLoading(false);
    }
  }

  loadMeals();
}, [isAuthenticated, accessToken]);


  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleEdit(meal) {
    setForm({
      name: meal.name || "",
      image: meal.image || "",
      category: meal.category || "",
      cuisine: meal.cuisine || "",
    });

    setEditingId(meal.id);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setNotice("");

      const mealData = {
        ...form,
        mealData: editingId
          ? meals.find((meal) => meal.id === editingId)?.mealData || {}
          : {},
      };

      if (editingId) {
        const updatedMeal = await updateAdminMeal(
          accessToken,
          editingId,
          mealData
        );

        setMeals((current) =>
          current.map((meal) =>
            meal.id === editingId ? updatedMeal : meal
          )
        );

        setNotice("Meal updated successfully.");
      } else {
        const newMeal = await createAdminMeal(accessToken, mealData);

        setMeals((current) => [newMeal, ...current]);
        setNotice("Meal added successfully.");
      }

      resetForm();
    } catch (err) {
      setError(err.message || "Unable to save the meal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(meal) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${meal.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setNotice("");

      await deleteAdminMeal(accessToken, meal.id);

      setMeals((current) =>
        current.filter((item) => item.id !== meal.id)
      );

      if (editingId === meal.id) {
        resetForm();
      }

      setNotice("Meal deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete the meal.");
    }
  }

  if (!isAuthenticated) {
    return (
      <section className="admin-meals-page">
        <PageHeader
          eyebrow="Administration"
          title="Meal Management"
          description="Please log in before accessing meal management."
        />
        <EmptyState
          title="Login required"
          message="You need to log in before accessing this page."
        />
      </section>
    );
  }

  if (accessDenied) {
    return (
      <section className="admin-meals-page">
        <PageHeader
          eyebrow="Administration"
          title="Meal Management"
          description="Manage the meals available in GlobalTaste."
        />
        <EmptyState
          title="Access denied"
          message="Your account does not have administrator permission to manage meals."
        />
      </section>
    );
  }

  return (
    <section className="admin-meals-page">
      <PageHeader
        eyebrow="Administration"
        title="Meal Management"
        description="Add, update and remove meals from the GlobalTaste collection."
      />

      {error && (
        <p className="admin-message admin-error" role="alert">
          {error}
        </p>
      )}

      {notice && (
        <p className="admin-message admin-success" role="status">
          {notice}
        </p>
      )}

      <section className="admin-form-section">
        <h2>{editingId ? "Edit Meal" : "Add a New Meal"}</h2>

        <form className="admin-meal-form" onSubmit={handleSubmit}>
          <label>
            Meal name *
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              maxLength="255"
              required
            />
          </label>

          <label>
            Image URL
            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/meal.jpg"
            />
          </label>

          <label>
            Category
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              maxLength="120"
              placeholder="e.g. Seafood"
            />
          </label>

          <label>
            Cuisine
            <input
              type="text"
              name="cuisine"
              value={form.cuisine}
              onChange={handleChange}
              maxLength="120"
              placeholder="e.g. Kenyan"
            />
          </label>

          <div className="admin-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Meal"
                  : "Add Meal"}
            </button>

            {editingId && (
              <button
                type="button"
                className="admin-cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-meal-list-section">
        <h2>Managed Meals ({meals.length})</h2>

        {loading ? (
          <p>Loading meals...</p>
        ) : meals.length === 0 ? (
          <EmptyState
            title="No managed meals yet"
            message="Use the form above to add your first meal."
          />
        ) : (
          <div className="admin-meal-grid">
            {meals.map((meal) => (
              <article className="admin-meal-card" key={meal.id}>
                {meal.image ? (
                  <img src={meal.image} alt={meal.name} />
                ) : (
                  <div className="admin-meal-no-image">
                    No image available
                  </div>
                )}

                <div className="admin-meal-card-content">
                  <h3>{meal.name}</h3>

                  <p>
                    {meal.category || "Uncategorised"}
                    {meal.cuisine ? ` · ${meal.cuisine}` : ""}
                  </p>

                  <div className="admin-card-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(meal)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="admin-delete-button"
                      onClick={() => handleDelete(meal)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminMeals;
