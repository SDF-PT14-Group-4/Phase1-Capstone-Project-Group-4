import { useParams } from "react-router-dom";

function MealDetails() {
  const { id } = useParams();

  return (
    <main>
      <h1>Meal Details</h1>
      <p>Meal ID: {id}</p>
    </main>
  );
}

export default MealDetails;