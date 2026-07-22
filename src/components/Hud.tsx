import { useGame } from "../state/GameContext";
import { netWorth } from "../engine/loans";
import { formatMoney, monthLabel } from "../format";
import { useFullscreen } from "../useFullscreen";

export function Hud({ onOpenPanel }: { onOpenPanel: () => void }) {
  const { world, player, advanceMonth } = useGame();
  const { isFullscreen, toggle } = useFullscreen();
  if (!world || !player) return null;

  return (
    <header className="hud">
      <div className="hud-left">
        <span className="hud-logo" style={{ background: player.color }} />
        <div>
          <strong>{player.name}</strong>
          <span className="hud-date">{monthLabel(world.month)}</span>
        </div>
      </div>

      <div className="hud-stats">
        <Stat label="Cash" value={formatMoney(player.cash)} negative={player.cash < 0} />
        <Stat label="Net worth" value={formatMoney(netWorth(player))} />
        <Stat label="Reputation" value={`${Math.round(player.reputation)}`} />
        <Stat label="Fleet" value={`${player.fleet.length}`} />
        <Stat label="Routes" value={`${player.routes.length}`} />
      </div>

      <div className="hud-actions">
        <button className="ghost" onClick={toggle} title="Toggle fullscreen">
          {isFullscreen ? "⤢ Exit" : "⤢ Fullscreen"}
        </button>
        <button className="ghost" onClick={onOpenPanel}>
          ☰ Manage
        </button>
        <button className="advance" onClick={advanceMonth} disabled={world.gameOver}>
          Advance month →
        </button>
      </div>
    </header>
  );
}

function Stat({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <div className="hud-stat">
      <span className="hud-stat-label">{label}</span>
      <span className={`hud-stat-value${negative ? " negative" : ""}`}>{value}</span>
    </div>
  );
}
