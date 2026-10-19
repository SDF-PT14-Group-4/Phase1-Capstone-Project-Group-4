export const STORAGE_KEYS = {
basket: "mealBasket",
planner: "weeklyPlanner",
};

export function readStorage(key, fallback) {
try {
const storedValue = localStorage.getItem(key);
return storedValue === null ? fallback : JSON.parse(storedValue);
} catch (error) {
console.error(`Unable to read "${key}" from local storage:`, error);
return fallback;
}
}

export function writeStorage(key, value) {
try {
localStorage.setItem(key, JSON.stringify(value));
} catch (error) {
console.error(`Unable to write "${key}" to local storage:`, error);
}
}