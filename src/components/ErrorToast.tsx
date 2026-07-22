import { useEffect } from "react";
import { useGame } from "../state/GameContext";
import { playSound } from "../sound";

export function ErrorToast() {
  const { lastError, dismissError } = useGame();

  useEffect(() => {
    if (!lastError) return;
    playSound("error");
    const t = setTimeout(dismissError, 4000);
    return () => clearTimeout(t);
  }, [lastError, dismissError]);

  if (!lastError) return null;

  return (
    <div className="error-toast" role="alert" onClick={dismissError}>
      <span>{lastError}</span>
      <button aria-label="Dismiss">×</button>
    </div>
  );
}
