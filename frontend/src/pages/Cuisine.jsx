import PageHeader from "../components/common/PageHeader";
import CuisineCard from "../components/meal/CuisineCard";
import { SUPPORTED_CUISINES } from "../services/mealDbApi";

function Cuisines() {
  return (
    <>
      <PageHeader eyebrow="EXPLORE" title="Cuisines" description="Explore meals by geographical or cultural cuisine/area." />
      <div className="cuisine-grid">
        {SUPPORTED_CUISINES.map((cuisine) => <CuisineCard key={cuisine} cuisine={cuisine} />)}
      </div>
    </>
  );
}
export default Cuisines