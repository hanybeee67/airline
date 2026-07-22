import type { Airline } from "./types";
import { findAircraftType } from "./data";
import { LOAN_ANNUAL_RATE, LOAN_MAX_LEVERAGE, LOAN_TERM_MONTHS } from "./constants";

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

/** Rough liquidation value of owned aircraft, used for leverage limits and net worth. */
export function fleetValue(airline: Airline): number {
  return airline.fleet.reduce((sum, aircraft) => {
    if (aircraft.acquisitionMode !== "owned") return sum;
    const type = findAircraftType(aircraft.aircraftTypeId);
    return sum + type.purchasePrice * 0.55 * (aircraft.condition / 100);
  }, 0);
}

export function totalDebt(airline: Airline): number {
  return airline.loans.reduce((sum, loan) => sum + loan.balance, 0);
}

/** Net worth: liquid cash plus fleet value, less outstanding debt. */
export function netWorth(airline: Airline): number {
  return airline.cash + fleetValue(airline) - totalDebt(airline);
}

/** Maximum additional amount the airline may borrow right now. */
export function maxBorrowable(airline: Airline): number {
  // Borrowing raises cash and debt equally, so net worth (not raw cash) is the
  // stable base — this prevents a leverage spiral where borrowed cash unlocks
  // ever more borrowing.
  const cap = LOAN_MAX_LEVERAGE * Math.max(netWorth(airline), 0) - totalDebt(airline);
  return Math.max(0, Math.floor(cap));
}

function amortizedPayment(principal: number, monthlyRate: number, termMonths: number): number {
  if (monthlyRate === 0) return principal / termMonths;
  const factor = (1 + monthlyRate) ** termMonths;
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function takeLoan(airline: Airline, amount: number): Airline {
  if (amount <= 0) throw new Error("Loan amount must be positive.");
  if (amount > maxBorrowable(airline)) {
    throw new Error("Loan amount exceeds what the bank will lend against your equity.");
  }

  const monthlyRate = LOAN_ANNUAL_RATE / 12;
  const loan = {
    id: newId("loan"),
    principal: amount,
    balance: amount,
    monthlyRate,
    monthlyPayment: amortizedPayment(amount, monthlyRate, LOAN_TERM_MONTHS),
    termMonths: LOAN_TERM_MONTHS,
    takenMonth: -1,
  };

  return { ...airline, cash: airline.cash + amount, loans: [...airline.loans, loan] };
}

export function repayLoan(airline: Airline, loanId: string): Airline {
  const loan = airline.loans.find((l) => l.id === loanId);
  if (!loan) throw new Error("Loan not found.");
  if (airline.cash < loan.balance) throw new Error("Not enough cash to repay this loan in full.");

  return {
    ...airline,
    cash: airline.cash - loan.balance,
    loans: airline.loans.filter((l) => l.id !== loanId),
  };
}
