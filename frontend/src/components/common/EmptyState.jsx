function EmptyState({ title = "Nothing here yet", message, action }) {
  return (
    <div className="state-card">
      <h2>{title}</h2>
      <p>{message || "There is nothing to display."}</p>
      {action}
    </div>
  );
}
export default EmptyState;
