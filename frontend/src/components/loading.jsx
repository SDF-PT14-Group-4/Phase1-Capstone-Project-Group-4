
function Loading({ message = "Please wait, loading..." }) {
  return (
    <div
      className="loading-container"
      role="status"
      aria-live="polite"
    >
      <div className="loading-spinner"></div>

      <p className="loading-message">{message}</p>
    </div>
  );
}

export default Loading;
