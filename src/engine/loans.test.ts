import { describe, expect, it } from "vitest";
import { maxBorrowable, repayLoan, takeLoan, totalDebt } from "./loans";
import { makeAirline } from "./testSupport";

describe("loans", () => {
  it("adds cash and records debt when taking a loan", () => {
    const airline = makeAirline({ cash: 100_000_000 });
    const after = takeLoan(airline, 50_000_000);
    expect(after.cash).toBe(150_000_000);
    expect(totalDebt(after)).toBe(50_000_000);
    expect(after.loans[0].monthlyPayment).toBeGreaterThan(0);
  });

  it("refuses to lend beyond the leverage cap", () => {
    const airline = makeAirline({ cash: 10_000_000 });
    expect(() => takeLoan(airline, 999_000_000)).toThrow();
  });

  it("repays a loan in full from cash", () => {
    let airline = makeAirline({ cash: 100_000_000 });
    airline = takeLoan(airline, 40_000_000);
    const loanId = airline.loans[0].id;
    const repaid = repayLoan(airline, loanId);
    expect(repaid.loans).toHaveLength(0);
    expect(repaid.cash).toBeLessThan(airline.cash);
  });

  it("caps maxBorrowable at zero when already heavily indebted", () => {
    let airline = makeAirline({ cash: 20_000_000 });
    airline = takeLoan(airline, maxBorrowable(airline));
    expect(maxBorrowable(airline)).toBe(0);
  });
});
