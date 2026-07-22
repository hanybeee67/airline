import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import type { AcquisitionMode, Company } from "../engine/types";
import { createCompany } from "../engine/company";
import * as companyActions from "../engine/company";
import { simulateMonth } from "../engine/simulation";
import type { OpenRouteInput } from "../engine/company";

interface GameState {
  company: Company | null;
  lastError: string | null;
}

type Action =
  | { type: "START_GAME"; name: string }
  | { type: "BUY_AIRCRAFT"; aircraftTypeId: string; mode: AcquisitionMode }
  | { type: "SELL_AIRCRAFT"; aircraftId: string }
  | { type: "OPEN_ROUTE"; input: OpenRouteInput }
  | { type: "CLOSE_ROUTE"; routeId: string }
  | { type: "SET_FARE"; routeId: string; fare: number }
  | { type: "SET_FREQUENCY"; routeId: string; weeklyFrequency: number }
  | { type: "ADVANCE_MONTH" }
  | { type: "DISMISS_ERROR" };

function reducer(state: GameState, action: Action): GameState {
  try {
    switch (action.type) {
      case "START_GAME":
        return { company: createCompany(action.name), lastError: null };
      case "DISMISS_ERROR":
        return { ...state, lastError: null };
    }

    if (!state.company) return state;

    switch (action.type) {
      case "BUY_AIRCRAFT":
        return {
          company: companyActions.buyAircraft(state.company, action.aircraftTypeId, action.mode),
          lastError: null,
        };
      case "SELL_AIRCRAFT":
        return {
          company: companyActions.sellAircraft(state.company, action.aircraftId),
          lastError: null,
        };
      case "OPEN_ROUTE":
        return {
          company: companyActions.openRoute(state.company, action.input),
          lastError: null,
        };
      case "CLOSE_ROUTE":
        return {
          company: companyActions.closeRoute(state.company, action.routeId),
          lastError: null,
        };
      case "SET_FARE":
        return {
          company: companyActions.setFare(state.company, action.routeId, action.fare),
          lastError: null,
        };
      case "SET_FREQUENCY":
        return {
          company: companyActions.setFrequency(state.company, action.routeId, action.weeklyFrequency),
          lastError: null,
        };
      case "ADVANCE_MONTH":
        return { company: simulateMonth(state.company).company, lastError: null };
      default:
        return state;
    }
  } catch (err) {
    return { ...state, lastError: err instanceof Error ? err.message : String(err) };
  }
}

interface GameContextValue extends GameState {
  startGame: (name: string) => void;
  buyAircraft: (aircraftTypeId: string, mode: AcquisitionMode) => void;
  sellAircraft: (aircraftId: string) => void;
  openRoute: (input: OpenRouteInput) => void;
  closeRoute: (routeId: string) => void;
  setFare: (routeId: string, fare: number) => void;
  setFrequency: (routeId: string, weeklyFrequency: number) => void;
  advanceMonth: () => void;
  dismissError: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { company: null, lastError: null });

  const startGame = useCallback((name: string) => dispatch({ type: "START_GAME", name }), []);
  const buyAircraft = useCallback(
    (aircraftTypeId: string, mode: AcquisitionMode) =>
      dispatch({ type: "BUY_AIRCRAFT", aircraftTypeId, mode }),
    [],
  );
  const sellAircraft = useCallback(
    (aircraftId: string) => dispatch({ type: "SELL_AIRCRAFT", aircraftId }),
    [],
  );
  const openRoute = useCallback(
    (input: OpenRouteInput) => dispatch({ type: "OPEN_ROUTE", input }),
    [],
  );
  const closeRoute = useCallback((routeId: string) => dispatch({ type: "CLOSE_ROUTE", routeId }), []);
  const setFare = useCallback(
    (routeId: string, fare: number) => dispatch({ type: "SET_FARE", routeId, fare }),
    [],
  );
  const setFrequency = useCallback(
    (routeId: string, weeklyFrequency: number) =>
      dispatch({ type: "SET_FREQUENCY", routeId, weeklyFrequency }),
    [],
  );
  const advanceMonth = useCallback(() => dispatch({ type: "ADVANCE_MONTH" }), []);
  const dismissError = useCallback(() => dispatch({ type: "DISMISS_ERROR" }), []);

  const value = useMemo<GameContextValue>(
    () => ({
      ...state,
      startGame,
      buyAircraft,
      sellAircraft,
      openRoute,
      closeRoute,
      setFare,
      setFrequency,
      advanceMonth,
      dismissError,
    }),
    [state, startGame, buyAircraft, sellAircraft, openRoute, closeRoute, setFare, setFrequency, advanceMonth, dismissError],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}
