import requests
from flask import current_app


class MealServiceError(Exception):
    pass


def get_mealdb(path, params=None):
    base_url = current_app.config["MEALDB_BASE_URL"].rstrip("/")
    try:
        response = requests.get(
            f"{base_url}/{path.lstrip('/')}", params=params, timeout=(3.05, 10)
        )
        response.raise_for_status()
        data = response.json()
    except (requests.RequestException, ValueError) as error:
        current_app.logger.warning("TheMealDB request failed: %s", error)
        raise MealServiceError("The meal service is temporarily unavailable.") from error

    if not isinstance(data, dict):
        raise MealServiceError("The meal service returned an invalid response.")
    return data
