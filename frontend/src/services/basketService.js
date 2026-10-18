import { requireApiBaseUrl } from "./apiConfig.js";

export class BasketApiError extends Error {
  constructor(message, code = "BASKET_REQUEST_FAILED", status = 0) {
    super(message);
    this.name = "BasketApiError";
    this.code = code;
    this.status = status;
  }
}

async function requestBasket(path, accessToken, options = {}) {
  let apiBaseUrl;
  try {
    apiBaseUrl = requireApiBaseUrl();
  } catch (error) {
    throw new BasketApiError(error.message, "API_NOT_CONFIGURED");
  }

  let response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new BasketApiError(
      "Unable to connect to the basket service. Check your connection and try again.",
      "NETWORK_ERROR"
    );
  }

  if (response.status === 204) {
    return null;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new BasketApiError(
      "The basket service returned an invalid response.",
      "INVALID_RESPONSE",
      response.status
    );
  }

  if (!response.ok) {
    throw new BasketApiError(
      data?.error?.message || "The basket service could not complete your request.",
      data?.error?.code || "BASKET_REQUEST_FAILED",
      response.status
    );
  }

  return data;
}

export async function getBasket(accessToken) {
  const data = await requestBasket("/me/basket", accessToken);
  if (!Array.isArray(data?.items) || typeof data.total !== "number") {
    throw new BasketApiError(
      "The basket service returned an invalid response.",
      "INVALID_RESPONSE"
    );
  }
  return data;
}

export function addBasketItem(accessToken, meal, price) {
  return requestBasket("/me/basket", accessToken, {
    method: "POST",
    body: JSON.stringify({
      mealId: meal.id,
      name: meal.name,
      image: meal.image || meal.thumbnail || "",
      category: meal.category || "",
      cuisine: meal.cuisine || "",
      price,
    }),
  });
}

export function updateBasketQuantity(accessToken, mealId, quantity) {
  return requestBasket(`/me/basket/${encodeURIComponent(mealId)}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export function removeBasketItem(accessToken, mealId) {
  return requestBasket(`/me/basket/${encodeURIComponent(mealId)}`, accessToken, {
    method: "DELETE",
  });
}

export function clearBasketItems(accessToken) {
  return requestBasket("/me/basket", accessToken, { method: "DELETE" });
}
