import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import type { AcquisitionMode, Airline, World } from "../engine/types";
import { createWorld, advanceMonth } from "../engine/world";
import * as airlineActions from "../engine/airline";
import * as loanActions from "../engine/loans";
import { hireCrew } from "../engine/crew";
import type { OpenRouteInput } from "../engine/airline";

interface GameState {
  world: World | null;
  lastError: string | null;
}

type Action =
  | { type: "START_GAME"; name: string }
  | { type: "ADVANCE_MONTH" }
  | { type: "PLAYER"; fn: (player: Airline, world: World) => Airline }
  | { type: "DISMISS_ERROR" };

function updatePlayer(world: World, fn: (player: Airline, world: World) => Airline): World {
  const player = world.airlines[0];
  const updated = fn(player, world);
  return { ...world, airlines: [updated, ...world.airlines.slice(1)] };
}

function reducer(state: GameState, action: Action): GameState {
  try {
    switch (action.type) {
      case "START_GAME":
        return { world: createWorld(action.name), lastError: null };
      case "DISMISS_ERROR":
        return { ...state, lastError: null };
    }

    if (!state.world) return state;

    switch (action.type) {
      case "ADVANCE_MONTH":
        return { world: advanceMonth(state.world).world, lastError: null };
      case "PLAYER":
        return { world: updatePlayer(state.world, action.fn), lastError: null };
      default:
        return state;
    }
  } catch (err) {
    return { ...state, lastError: err instanceof Error ? err.message : String(err) };
  }
}

interface GameContextValue extends GameState {
  player: Airline | null;
  startGame: (name: string) => void;
  advanceMonth: () => void;
  buyAircraft: (aircraftTypeId: string, mode: AcquisitionMode) => void;
  sellAircraft: (aircraftId: string) => void;
  openRoute: (input: OpenRouteInput) => void;
  closeRoute: (routeId: string) => void;
  setFare: (routeId: string, fare: number) => void;
  setFrequency: (routeId: string, weeklyFrequency: number) => void;
  hireCrew: (count: number) => void;
  takeLoan: (amount: number) => void;
  repayLoan: (loanId: string) => void;
  dismissError: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { world: null, lastError: null });

  const player = useCallback(
    (fn: (player: Airline, world: World) => Airline) => dispatch({ type: "PLAYER", fn }),
    [],
  );

  const value = useMemo<GameContextValue>(
    () => ({
      ...state,
      player: state.world ? state.world.airlines[0] : null,
      startGame: (name) => dispatch({ type: "START_GAME", name }),
      advanceMonth: () => dispatch({ type: "ADVANCE_MONTH" }),
      buyAircraft: (id, mode) => player((p) => airlineActions.buyAircraft(p, id, mode)),
      sellAircraft: (id) => player((p) => airlineActions.sellAircraft(p, id)),
      openRoute: (input) => player((p) => airlineActions.openRoute(p, input)),
      closeRoute: (id) => player((p) => airlineActions.closeRoute(p, id)),
      setFare: (id, fare) => player((p) => airlineActions.setFare(p, id, fare)),
      setFrequency: (id, freq) => player((p) => airlineActions.setFrequency(p, id, freq)),
      hireCrew: (count) => player((p, w) => hireCrew(p, count, w.month)),
      takeLoan: (amount) => player((p) => loanActions.takeLoan(p, amount)),
      repayLoan: (id) => player((p) => loanActions.repayLoan(p, id)),
      dismissError: () => dispatch({ type: "DISMISS_ERROR" }),
    }),
    [state, player],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}
