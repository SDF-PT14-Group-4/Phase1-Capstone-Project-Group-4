export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state-card error-state" role="alert">
      <h2>Something went wrong</h2>
      <p>{message || "Unable to load this content."}</p>
      {onRetry && (
        <button className="button primary" type="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
