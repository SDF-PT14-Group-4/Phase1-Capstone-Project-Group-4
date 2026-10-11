import { Link } from "react-router-dom";
import "./Discovery.css";

const featuredCategories = [
  { name: "Chicken", icon: "🍗", tone: "peach" },
  { name: "Seafood", icon: "🐟", tone: "blue" },
  { name: "Vegetarian", icon: "🥑", tone: "green" },
  { name: "Dessert", icon: "🍰", tone: "pink" },
];

function Home() {
  return (
    <main className="discovery-page home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">GOOD FOOD, FROM EVERYWHERE</p>
          <h1>A world of flavor is waiting.</h1>
          <p className="home-hero-description">
            Find your next favorite recipe, explore cuisines from around the
            globe, and bring something new to the table.
          </p>
          <div className="home-hero-actions">
            <Link className="discovery-button discovery-button-primary" to="/search">
              Find a recipe
            </Link>
            <Link className="discovery-button discovery-button-secondary" to="/categories">
              Explore categories
            </Link>
          </div>
        </div>
        <div className="home-hero-art" aria-hidden="true">
          <span className="hero-art-sparkle sparkle-one">✦</span>
          <span className="hero-art-sparkle sparkle-two">✧</span>
          <div className="hero-art-dish">🍲</div>
          <span className="hero-art-caption">Something delicious starts here</span>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PICK YOUR CRAVING</p>
            <h2>What sounds good?</h2>
          </div>
          <Link className="text-link" to="/categories">
            All categories <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="featured-category-grid">
          {featuredCategories.map(({ name, icon, tone }) => (
            <Link
              className={`featured-category-card ${tone}`}
              key={name}
              to={`/categories/${encodeURIComponent(name)}`}
            >
              <span className="featured-category-icon" aria-hidden="true">
                {icon}
              </span>
              <span className="featured-category-name">{name}</span>
              <span className="featured-category-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-cuisine-banner">
        <div>
          <p className="eyebrow">TAKE A TASTY TRIP</p>
          <h2>Recipes have no borders.</h2>
          <p>Discover the dishes and traditions that make every cuisine unique.</p>
        </div>
        <Link className="discovery-button discovery-button-light" to="/cuisines">
          Explore cuisines <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}

export default Home;
