from datetime import datetime, timezone

from werkzeug.security import check_password_hash, generate_password_hash

from . import db


def utc_now():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(254), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)

    favorites = db.relationship("FavoriteMeal", back_populates="user", cascade="all, delete-orphan")
    planned_meals = db.relationship("PlannedMeal", back_populates="user", cascade="all, delete-orphan")
    basket_items = db.relationship("BasketItem", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class MealRecord(db.Model):
    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True)
    meal_id = db.Column(db.String(64), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    image = db.Column(db.Text, nullable=False, default="")
    category = db.Column(db.String(120), nullable=False, default="")
    cuisine = db.Column(db.String(120), nullable=False, default="")
    meal_data = db.Column(db.JSON, nullable=False, default=dict)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)


class FavoriteMeal(MealRecord):
    __tablename__ = "favorite_meals"
    __table_args__ = (db.UniqueConstraint("user_id", "meal_id", name="uq_favorite_user_meal"),)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    user = db.relationship("User", back_populates="favorites")


class PlannedMeal(MealRecord):
    __tablename__ = "planned_meals"
    __table_args__ = (
        db.UniqueConstraint("user_id", "day", "meal_id", name="uq_planned_user_day_meal"),
        db.CheckConstraint(
            "day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')",
            name="ck_planned_meal_day",
        ),
    )

    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    day = db.Column(db.String(9), nullable=False, index=True)
    user = db.relationship("User", back_populates="planned_meals")


class BasketItem(MealRecord):
    __tablename__ = "basket_items"
    __table_args__ = (
        db.UniqueConstraint("user_id", "meal_id", name="uq_basket_user_meal"),
        db.CheckConstraint("quantity > 0", name="ck_basket_quantity_positive"),
        db.CheckConstraint("price >= 0", name="ck_basket_price_nonnegative"),
    )

    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    price = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    user = db.relationship("User", back_populates="basket_items")
