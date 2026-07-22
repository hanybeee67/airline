import { useGame } from "../state/GameContext";

export function ErrorToast() {
  const { lastError, dismissError } = useGame();
  if (!lastError) return null;

  return (
    <div className="error-toast" role="alert">
      <span>{lastError}</span>
      <button onClick={dismissError}>×</button>
    </div>
  );
}
